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
    await this.createRecordsForSensor(tempIn, global_unit_config, 100, 15, 25, 0.1)

    const tempOut = await Sensor.create({
      slug: 'tempOut',
      interval: 10,
      interval_unit: 'second',
      summary_type: 'min-max-avg',
      unit_type: 'temperature',
      weather_station_id: weather_station.id,
    })
    await this.createRecordsForSensor(tempOut, global_unit_config, 100, -25, 25, 0.1)

    const pressure = await Sensor.create({
      slug: 'pressure',
      interval: 120,
      interval_unit: 'second',
      summary_type: 'min-max-avg',
      unit_type: 'temperature',
      weather_station_id: weather_station.id,
    })
    await this.createRecordsForSensor(pressure, global_unit_config, 100, 980, 1035, 0)

    const wind = await Sensor.create({
      slug: 'wind',
      interval: 100,
      interval_unit: 'second',
      summary_type: 'max-avg',
      unit_type: 'wind',
      weather_station_id: weather_station.id,
    })
    await this.createRecordsForSensor(wind, global_unit_config, 100, 0, 50, 0.2)

    const rain15min = await Sensor.create({
      slug: 'rain15min',
      interval: 15,
      interval_unit: 'minute',
      summary_type: 'sum',
      unit_type: 'precipation',
      weather_station_id: weather_station.id,
    })
    await this.createRecordsForSensor(rain15min, global_unit_config, 100, 0, 5, 0.4)

    await Sensor.create({
      slug: 'rainRate',
      interval: 10,
      interval_unit: 'second',
      summary_type: 'avg',
      unit_type: 'precipation',
      weather_station_id: weather_station.id,
    })

    const conditions = await Sensor.create({
      slug: 'conditions',
      interval: 1,
      interval_unit: 'minute',
      summary_type: 'custom',
      unit_type: 'none',
      weather_station_id: weather_station.id,
    })
    await this.createRecordsForSensor(conditions, global_unit_config, 100, 0, 5, 0.05, false)
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
