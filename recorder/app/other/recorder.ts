import axios from 'axios'
import { Schedule, schedule } from './scheduler.js'
import { IRecord, WeatherStationInterface } from './weather_station_interface.js'
import * as fs from 'fs'
import { Logger } from '@adonisjs/core/logger'
import { Queue } from '@datastructures-js/queue';
import RecorderJob from '#models/recorder_job'
import FailedToStartJobException from '#exceptions/failed_to_start_job_exception'

/**
 * The recorder records weather data for each configured sensor of a weather station and sends them to the api.
 * It can be a seperate process.
 * 
 * It uses the intervals configured in the station's interface. It automatically downloads the interface and it's
 * configuration from the api.
 * 
 * The recorder is robust against an unavailable api or internet connection. It stores failed records in a queue and tries to upload
 * them again later. Records are always sent in order (even on failure).
 */
export class Recorder {
  public job: RecorderJob;

  private station_interface!: WeatherStationInterface
  private sensor_schedules: { [T in string]: Schedule } = {}
  private logger: Logger

  private queue: Queue<IRecord> = new Queue()
  private state: "running" | "waiting-until-active" | "stopped" = "stopped";

  private auth_token?: string

  private sleep(time_milliseconds: number) {
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        resolve();
      }, time_milliseconds);
    })
  }

  private async login(username: string, password: string) {
    try {
      const response = await axios({
        method: 'post',
        url: `${this.job.api_url}/auth/login`,
        data: {
          username,
          password
        },
        headers: {
          'content-type': 'application/json',
        },
      })
      if (!response.data.success) {
        throw new Error(response.data.error?.message)
      }
      this.auth_token = response.data.data.auth_token;
      this.logger.info("Recorder successfully logged in!");
    } catch (err) {
      throw new Error(err?.message)
    }
  }

  private async wait_until_active(){
    const url = `${this.job.api_url}/weather-stations/${this.job.station_slug}/state`
    try {
      this.logger.info("Checking station state...");
      const response = await axios({
        method: 'get',
        url,
        headers: {
          'content-type': 'application/json',
          "OWVISION_AUTH_TOKEN": this.auth_token
        },
      })

      if(!response.data.success){
        return this.logger.error(`Error (${response.data.error?.code}) while checking station state: ${response.data.error?.message}`)
      }

      if(response.data.data === "active"){
        this.state = "running";
        this.logger.warn('Station is active again! Starting to record again...')
      }
    }catch(err){
      this.logger.warn("Failed to connect to owvision demon (network error)! Trying later...")
    }

    if (this.state === "running") {
      this.start_recording();
      this.start_record_pusher();
    }else if(this.state === "waiting-until-active"){
      await this.sleep(1000);
      this.wait_until_active();
    }
  }

  private async start_record_pusher() {
    while (!this.queue.isEmpty() && this.state === "running") {
      const sent_successfully = await this.post_oldest_record();
      if (!sent_successfully) break;
    }
    if (this.state === "running") {
      await this.sleep(1000);
      this.start_record_pusher();
    }else if(this.state === "waiting-until-active"){
      this.stop_recording();
      this.wait_until_active();
    }
  }

  private async post_oldest_record() {
    const record = this.queue.front();
    const url = `${this.job.api_url}/weather-stations/${this.job.station_slug}/sensors/${record.sensor_slug}/`
    try {
      this.logger.info("Sending record...");
      const response = await axios({
        method: 'post',
        url,
        data: {
          created_at: record.created_at,
          unit: record.unit,
          value: record.value
        },
        headers: {
          'content-type': 'application/json',
          "OWVISION_AUTH_TOKEN": this.auth_token
        },
      })

      if(!response.data.success){
        if (response.data.error?.code === 'E_VALIDATION_ERROR') {
          this.logger.error(`Validation error: '${response?.data?.error?.message}'. Trying to send again later...`)
        }
        else if (response.data.error?.code === 'E_PLEASE_STOP') {
          this.logger.warn('Received stop signal... waiting until station is active again!')
          this.state = "waiting-until-active"
          this.queue.clear()
        }else{
          this.logger.error(`Unknown error (${response.data.error?.code}): ${response.data.error?.message}. Trying to send again later...`)
        }
        return false;
      }

      this.logger.info("Sent successfully!");
      this.queue.dequeue();
      return true;
    } catch (err) {
      this.logger.warn("Failed to connect to owvision demon (network error)! Trying later...")
      return false;
    }
  }

  private async load_station_interface() {
    try {
      const interface_response = await axios({
        method: 'get',
        url: `${this.job.api_url}/weather-stations/${this.job.station_slug}/interface`,
        responseType: 'stream',
        headers: {
          "OWVISION_AUTH_TOKEN": this.auth_token
        }
      })

      const config_response = await axios({
        method: 'get',
        url: `${this.job.api_url}/weather-stations/${this.job.station_slug}`,
        headers: {
          "OWVISION_AUTH_TOKEN": this.auth_token
        }
      })

      if (!config_response.data.success) {

        throw new Error(config_response.data.error?.message)
      }

      const interface_path = `./interfaces/${config_response.data.data.interface}.js`
      const interface_import_path = `../.${interface_path}`

      interface_response.data.pipe(fs.createWriteStream(interface_path))
      
      await this.sleep(2000);
      const interface_class = (await import(interface_import_path)).default
      this.station_interface = new interface_class(config_response.data.interface_config)

      await this.station_interface.connect()
    } catch (err) {
      throw new Error(err?.message);
    }
  }

  private async load_config_from_api() {
    await this.load_station_interface()
  }

  private async create_schedules() {
    for (const sensor_slug in this.station_interface.sensors) {
      const sensor_config = this.station_interface.sensors[sensor_slug]
      this.sensor_schedules[sensor_slug] = schedule(async (time) => {
        const record_raw = await this.station_interface.record(sensor_slug)
        const record = { ...record_raw, created_at: time, sensor_slug };
        this.logger.info(
          `Created record $(${this.job.station_slug}/${sensor_slug}): ${record.value} ${record.unit.toString()} [${record.created_at}]$`
        )
        this.queue.push(record);
      }).every(sensor_config.interval, sensor_config.interval_unit)
    }
  }

  constructor(job: RecorderJob, logger: Logger) {
    this.job = job
    this.logger = logger
  }

  /**
   * Starts the recorder.
   */
  async start() {
    for (const sensor_slug in this.sensor_schedules) {
      this.sensor_schedules[sensor_slug].start()
    }
    this.state = "running";
    this.start_record_pusher();
  }

  private stop_recording(){
    for (const sensor_slug in this.sensor_schedules) {
      this.sensor_schedules[sensor_slug].stop()
    }
  }

  private start_recording(){
    for (const sensor_slug in this.sensor_schedules) {
      this.sensor_schedules[sensor_slug].start()
    }
  }

  /**
   * Stops the recorder.
   */
  async stop() {
    this.logger.info("Stopping recorder!");
    this.stop_recording();
    this.state = "stopped";
  }

  /**
   * Creates a recorder. Throws if an invalid configuration is passed or no internet connection is available. 
   * @param weather_station_slug the station's slug
   * @param api_url the url to the api (e.g. localhost:3333/v1)
   * @param logger the logger
   * @returns a configured recorder
   */
  static async create(
    job: RecorderJob,
    logger: Logger
  ): Promise<Recorder> {
    try {
      const recorder = new Recorder(job, logger)
      await recorder.login("recorder", "recorder")
      await recorder.load_config_from_api()
      await recorder.create_schedules()
      return recorder
    } catch (err) {
      throw new FailedToStartJobException(job.station_slug, err.message);
    }
  }
}
