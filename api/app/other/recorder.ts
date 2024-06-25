import UnitConfig from '#models/unit_config'
import axios from 'axios'
import { Schedule, schedule } from './scheduler.js'
import { WeatherStationInterface } from './weather_station_interface.js'
import * as fs from 'fs'
import { Exception } from '@adonisjs/core/exceptions'
import { Logger } from '@adonisjs/core/logger'

// TODO
export class Recorder {
  private weather_station_slug: string
  private api_url: string

  private station_interface!: WeatherStationInterface
  private unit_config!: UnitConfig
  private sensor_schedules: { [T in string]: Schedule } = {}
  private logger: Logger

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
    this.unit_config = config_response.data.data.unit_config

    await this.station_interface.connect()
  }

  private async load_config_from_api() {
    await this.load_station_interface()
  }

  private async create_schedules() {
    for (const sensor_slug in this.station_interface.sensors) {
      const sensor_config = this.station_interface.sensors[sensor_slug]
      this.sensor_schedules[sensor_slug] = schedule(async () => {
        const record = await this.station_interface.record(sensor_slug)
        const url = `${this.api_url}/weather-stations/${this.weather_station_slug}/sensors/${sensor_slug}/`
        this.logger.info(
          `Record (${this.weather_station_slug}/${sensor_slug}): ${record.value} ${record.unit}`
        )
        this.logger.info(`Sending record to ${url}`)
        try {
          await axios({
            method: 'post',
            url,
            data: record,
            headers: {
              'content-type': 'application/json',
            },
          })
        } catch (err) {
          console.error(err.response.data.error)
        }
      }).every(sensor_config.interval, sensor_config.interval_unit)
    }
  }

  constructor(weather_station_slug: string, api_url: string, logger: Logger) {
    this.weather_station_slug = weather_station_slug
    this.api_url = api_url
    this.logger = logger
  }

  async start() {
    for (const sensor_slug in this.sensor_schedules) {
      this.sensor_schedules[sensor_slug].start()
    }
  }

  async stop() {
    for (const sensor_slug in this.sensor_schedules) {
      this.sensor_schedules[sensor_slug].stop()
    }
  }

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
