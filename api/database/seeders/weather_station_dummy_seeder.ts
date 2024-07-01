import Record from '#models/record'
import Sensor from '#models/sensor'
import UnitConfig from '#models/unit_config'
import WeatherStation from '#models/weather_station'
import { BaseSeeder } from '@adonisjs/lucid/seeders'
import { DateTime } from 'luxon'

export default class extends BaseSeeder {
  async run() {
    const global_unit_config = await UnitConfig.global_unit_config()
    const weather_station = await WeatherStation.create({
      interface: 'davis-vp2',
      interface_config: {
        path: 'COM3',
      },
      state: 'disconnected',
      slug: 'hueff-vp2',
      name: 'Hüffelsheimer Vantage Pro 2',
    })

    const tempIn = await Sensor.create({
      slug: 'tempIn',
      interval: 10,
      interval_unit: 'second',
      summary_type: 'min-max-avg',
      unit_type: 'temperature',
      weather_station_id: weather_station.id,
    })

    const tempOut = await Sensor.create({
      slug: 'tempOut',
      interval: 10,
      interval_unit: 'second',
      summary_type: 'min-max-avg',
      unit_type: 'temperature',
      weather_station_id: weather_station.id,
    })
  }

  randomRange(min: number, max: number) {
    return min + Math.random() * (max - min)
  }

  async createRecordsForSensor(
    sensor: Sensor,
    unit_config: UnitConfig,
    count: number,
    min: number,
    max: number,
    nullPossibilty: number = 0,
    floating_point_values: boolean = true
  ) {
    for (let i = 0; i < count; i++) {
      let value: number | null = this.randomRange(min, max)
      if (Math.random() > 1 - nullPossibilty) {
        value = null
      }

      if (!floating_point_values && value !== null) {
        value = Math.floor(value)
      }

      await Record.create({
        sensor_id: sensor.id,
        created_at: DateTime.now().minus({ [sensor.interval_unit]: sensor.interval * i }),
        value,
        unit: unit_config.of_type(sensor.unit_type),
      })
    }
  }
}
