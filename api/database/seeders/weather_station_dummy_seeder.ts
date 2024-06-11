import WeatherStationsController from '#controllers/weather_stations_controller'
import Record from '#models/record'
import Sensor from '#models/sensor'
import UnitConfig from '#models/unit_config'
import WeatherStation from '#models/weather_station'
import { BaseSeeder } from '@adonisjs/lucid/seeders'
import { DateTime } from 'luxon'

export default class extends BaseSeeder {
  async run() {
    const weather_station = await WeatherStation.create({
      interface: 'davis/vp2',
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
      value_type: 'double',
      weather_station_id: weather_station.id,
    })
    await this.createRecordsForSensor(tempIn, 100, 15, 25, 0.1)

    const tempOut = await Sensor.create({
      slug: 'tempOut',
      interval: 10,
      interval_unit: 'second',
      summary_type: 'min-max-avg',
      unit_type: 'temperature',
      value_type: 'double',
      weather_station_id: weather_station.id,
    })
    await this.createRecordsForSensor(tempOut, 100, -25, 25, 0.1)

    const pressure = await Sensor.create({
      slug: 'pressure',
      interval: 120,
      interval_unit: 'second',
      summary_type: 'min-max-avg',
      unit_type: 'temperature',
      value_type: 'double',
      weather_station_id: weather_station.id,
    })
    await this.createRecordsForSensor(pressure, 100, 980, 1035, 0)

    const wind = await Sensor.create({
      slug: 'wind',
      interval: 100,
      interval_unit: 'second',
      summary_type: 'max-avg',
      unit_type: 'wind',
      value_type: 'double',
      weather_station_id: weather_station.id,
    })
    await this.createRecordsForSensor(wind, 100, 0, 50, 0.2)

    const rain15min = await Sensor.create({
      slug: 'rain15min',
      interval: 15,
      interval_unit: 'minute',
      summary_type: 'sum',
      unit_type: 'precipation',
      value_type: 'double',
      weather_station_id: weather_station.id,
    })
    await this.createRecordsForSensor(rain15min, 100, 0, 5, 0.4)

    await Sensor.create({
      slug: 'rainRate',
      interval: 10,
      interval_unit: 'second',
      summary_type: 'avg',
      unit_type: 'precipation',
      value_type: 'double',
      weather_station_id: weather_station.id,
    })

    const conditions = await Sensor.create({
      slug: 'conditions',
      interval: 1,
      interval_unit: 'minute',
      summary_type: 'custom',
      unit_type: 'none',
      value_type: 'int',
      weather_station_id: weather_station.id,
    })
    await this.createRecordsForSensor(conditions, 100, 0, 5, 0.05)
  }

  randomRange(min: number, max: number) {
    return min + Math.random() * (max - min)
  }

  async createRecordsForSensor(
    sensor: Sensor,
    count: number,
    min: number,
    max: number,
    nullPossibilty: number = 0
  ) {
    for (let i = 0; i < count; i++) {
      let value: number | null = this.randomRange(min, max)
      if (Math.random() > 1 - nullPossibilty) {
        value = null
      }
      await Record.create({
        sensor_id: sensor.id,
        created_at: DateTime.now().minus({ [sensor.interval_unit]: sensor.interval * i }),
        value_float: sensor.value_type == 'double' ? value : undefined,
        value_int: sensor.value_type == 'int' ? value && Math.round(value) : undefined,
      })
    }
  }
}
