import UnitConfig from '#models/unit_config'
import axios from 'axios'
import { Schedule, schedule } from './scheduler.js'
import { IRecord, WeatherStationInterface } from './weather_station_interface.js'
import * as fs from 'fs'
import { Exception } from '@adonisjs/core/exceptions'
import { Logger } from '@adonisjs/core/logger'
import { Queue } from '@datastructures-js/queue';

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
  private weather_station_slug: string
  private api_url: string

  private station_interface!: WeatherStationInterface
  private sensor_schedules: { [T in string]: Schedule } = {}
  private logger: Logger

  private queue: Queue<IRecord> = new Queue()
  private queue_pusher?: NodeJS.Timeout
  private running: boolean = false

  private sleep(time_milliseconds: number){
    return new Promise<void>((resolve) => {
        setTimeout(() => {
          resolve();
        }, time_milliseconds);
    })
  }

  private async start_record_pusher(){
    while(!this.queue.isEmpty()){
      const sent_successfully = await this.post_oldest_record();
      if(!sent_successfully) break;
    }
    await this.sleep(1000);
    if(this.running){
      this.start_record_pusher();
    }
  }

  private async post_oldest_record(){
    const record = this.queue.front();
      const url = `${this.api_url}/weather-stations/${this.weather_station_slug}/sensors/${record.sensor_slug}/`
      try {
        this.logger.info("Sending record...");
        await axios({
          method: 'post',
          url,
          data: {
            created_at: record.created_at,
            unit: record.unit,
            value: record.value
          },
          headers: {
            'content-type': 'application/json',
          },
        })
        this.logger.info("Sent successfully!");
        this.queue.dequeue();
        return true;
      } catch (err) {
        if(err?.response?.data?.error?.code === 'validation-error'){
          this.logger.error('Validation error: ' + err?.response?.data?.error?.message)
        }
        this.logger.warn("Failed to sent! Trying later...")
        return false;
      }
  }

  private async load_station_interface() {
    const interface_response = await axios({
      method: 'get',
      url: `${this.api_url}/weather-stations/${this.weather_station_slug}/interface`,
      responseType: 'stream',
    })

    const config_response = await axios({
      method: 'get',
      url: `${this.api_url}/weather-stations/${this.weather_station_slug}`,
    })

    if (!config_response.data.success) {
      throw new Exception(config_response.data.error)
    }

    const interface_path = `./interfaces/${config_response.data.data.interface}.js`
    const interface_import_path = `../.${interface_path}`
    interface_response.data.pipe(fs.createWriteStream(interface_path))

    const interface_class = (await import(interface_import_path)).default
    this.station_interface = new interface_class(config_response.data.interface_config)

    await this.station_interface.connect()
  }

  private async load_config_from_api() {
    await this.load_station_interface()
  }

  private async create_schedules() {
    for (const sensor_slug in this.station_interface.sensors) {
      const sensor_config = this.station_interface.sensors[sensor_slug]
      this.sensor_schedules[sensor_slug] = schedule(async (time) => {
        const record_raw = await this.station_interface.record(sensor_slug)
        const record = { ...record_raw, created_at: time, sensor_slug};
        this.logger.info(
          `Created record $(${this.weather_station_slug}/${sensor_slug}): ${record.value} ${record.unit.toString()} [${record.created_at}]$`
        )
        this.queue.push(record);
      }).every(sensor_config.interval, sensor_config.interval_unit)
    }
  }

  constructor(weather_station_slug: string, api_url: string, logger: Logger) {
    this.weather_station_slug = weather_station_slug
    this.api_url = api_url
    this.logger = logger
  }

  /**
   * Starts the recorder.
   */
  async start() {
    for (const sensor_slug in this.sensor_schedules) {
      this.sensor_schedules[sensor_slug].start()
    }
    this.start_record_pusher();
    this.running = true;
  }

  /**
   * Stops the recorder.
   */
  async stop() {
    for (const sensor_slug in this.sensor_schedules) {
      this.sensor_schedules[sensor_slug].stop()
    }
    this.running = false;
  }

  /**
   * Creates a recorder. Throws if an invalid configuration is passed or no internet connection is available. 
   * @param weather_station_slug the station's slug
   * @param api_url the url to the api (e.g. localhost:3333/v1)
   * @param logger the logger
   * @returns a configured recorder
   */
  static async create(
    weather_station_slug: string,
    api_url: string,
    logger: Logger
  ): Promise<Recorder> {
    const recorder = new Recorder(weather_station_slug, api_url, logger)
    await recorder.load_config_from_api()
    await recorder.create_schedules()
    return recorder
  }
}
