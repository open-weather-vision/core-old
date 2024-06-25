import { WeatherStationInterface } from '../app/other/weather_station_interface.js'

export default class DavisVantagePro2Interface extends WeatherStationInterface {
  sensors = {
    tempIn: {
      interval: 10,
      interval_unit: 'second',
      name: 'Inside temperature',
      summary_type: 'min-max-avg',
      tags: ['primary'],
      unit_type: 'temperature',
    },
  }

  async connect() {
    return true
  }

  async record(sensor_slug) {
    return Promise.resolve({
      value: null,
      unit: 'none',
    })
  }
}
