import WeatherStation from '#models/weather_station'
import { Exception } from '@adonisjs/core/exceptions'
import Service from './service.js'
import { Recorder } from '../other/recorder.js'

class RecorderService extends Service {
  private recorders: {
    [T in string]: { station: WeatherStation; recorder: Recorder }
  } = {}

  async ready() {
    this.logger.info(`Starting local recorder service`)
    const weather_stations = await WeatherStation.query().where('remote_recorder', false).exec()
    for (const station of weather_stations) {
      try {
        this.add_station(station)
      } catch (err) {
        this.logger.error(
          err,
          `Failed to start the weather station recorder for station '${station.slug}' on service startup`
        )
      }
    }
  }

  /**
   * Initializes a recorder for the passed weather station. The weather station must have configured a valid interface.
   * @param station
   */
  async add_station(station: WeatherStation) {
    const StationInterface = await station.interface_class

    if (!StationInterface) {
      throw new Exception(
        `Unknown interface '${station.interface}'! Failed to initialize a recorder`
      )
    }
    this.recorders[station.slug] = {
      station,
      recorder: await Recorder.create(station.slug, 'http://localhost:3333/v1', this.logger),
    }
    this.recorders[station.slug].recorder.start()
    this.logger.info(`Started recorder for station '${station.slug}'`)
  }

  /**
   * Initializes a recorder for the passed weather station. The weather station must have configured a valid interface.
   * @param station
   */
  async remove_station(slug: string) {
    // this.recorders[slug].recorder.stop()
    delete this.recorders[slug]
    this.logger.info(`Stopped recorder for station '${slug}'`)
  }

  async terminating() {
    for (const slug in this.recorders) {
      this.remove_station(slug)
    }
    this.logger.info(`Stopped recorder service`)
  }
}

export default new RecorderService()
