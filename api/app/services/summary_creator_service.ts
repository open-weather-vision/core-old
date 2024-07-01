import WeatherStation from '#models/weather_station'
import { Exception } from '@adonisjs/core/exceptions'
import { SummaryCreator } from '../other/summary_creator.js'
import Service from './service.js'
import Record from '#models/record'

class SummaryCreatorService extends Service {
  private summary_creators: {
    [T in string]: { station: WeatherStation; summary_creator: SummaryCreator }
  } = {}

  async ready() {
    this.logger.info(`Starting summary creator service`)
    const weather_stations = await WeatherStation.query().exec()
    for (const station of weather_stations) {
      try {
        this.add_station(station)
      } catch (err) {
        this.logger.error(
          err,
          `Failed to start a weather station summary creator for station '${station.slug}' on service startup`
        )
      }
    }
  }

  /**
   * Initializes a summary creator for the passed weather station. The weather station must have configured a valid interface.
   * @param station
   */
  async add_station(station: WeatherStation) {
    const StationInterface = await station.interface_class

    if (!StationInterface) {
      throw new Exception(
        `Unknown interface '${station.interface}'! Failed to initialize a summary creator`
      )
    }
    this.summary_creators[station.slug] = {
      station,
      summary_creator: new SummaryCreator(
        station.id,
        new StationInterface(station.interface_config),
        this.logger
      ),
    }
    await this.summary_creators[station.slug].summary_creator.start()
    this.logger.info(`Started summary creator for station '${station.slug}'`)
  }

  /**
   * Initializes a summary creator for the passed weather station. The weather station must have configured a valid interface.
   * @param station
   */
  async remove_station(slug: string) {
    delete this.summary_creators[slug]
    this.logger.info(`Removed summary creator for station '${slug}'`)
  }

  async terminating() {
    for (const slug in this.summary_creators) {
      this.remove_station(slug)
    }
    this.logger.info(`Stopped summary creator service`)
  }

  async process_record(station_slug: string, record: Record) {
    if (await this.summary_creators[station_slug].summary_creator.process_record(record)) {
      this.logger.info(`Sucessfully processed record '${record.id}' of station '${station_slug}'!`)
      return true
    } else {
      this.logger.info(`Failed to process record '${record.id}' of station '${station_slug}'!`)
      return false
    }
  }
}

export default new SummaryCreatorService()
