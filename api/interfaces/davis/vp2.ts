import WeatherStationInterface, {
  SensorsDescription,
} from '../../app/other/weather_station_interface.js'

export default class DavisVantagePro2Interface extends WeatherStationInterface {
  sensors: SensorsDescription = {
    tempIn: {
      interval: 10,
      interval_unit: 'second',
      name: 'Inside temperature',
      summary_type: 'min-max-avg',
      tags: ['primary'],
      unit_type: 'temperature',
      value_type: 'double',
    },
  }

  async connect(): Promise<boolean> {
    return true
  }

  async record(sensor_slug: string): Promise<number | null> {
    return Promise.resolve(null)
  }
}
