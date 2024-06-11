// import type { HttpContext } from '@adonisjs/core/http'

import NotFoundException from '#exceptions/not_found_exception'
import Record from '#models/record'
import Sensor from '#models/sensor'
import Summary from '#models/summary'
import SummaryRecord from '#models/summary_record'
import WeatherStation from '#models/weather_station'
import { writeSensorValidator } from '#validators/sensor_write'
import { readSummaryValidator } from '#validators/summary_read'
import { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'

export default class SensorsController {
  async getAllOfStation(ctx: HttpContext) {
    const weather_station = await WeatherStation.query()
      .select('id')
      .where('slug', ctx.params.slug)
      .preload('sensors', (query) => {
        query.preload('tags')
      })
      .first()

    if (!weather_station) {
      throw new NotFoundException(
        `Cannot get sensors of unknown weather station '${ctx.params.slug}'`
      )
    }

    return {
      success: true,
      data: weather_station.sensors,
    }
  }

  async getOneOfStation(ctx: HttpContext) {
    const weather_station = await WeatherStation.query()
      .select('id')
      .where('slug', ctx.params.slug)
      .first()

    if (!weather_station) {
      throw new NotFoundException(
        `Cannot get sensor of unknown weather station '${ctx.params.slug}'`
      )
    }

    const sensor = await Sensor.query()
      .where('weather_station_id', weather_station.id)
      .where('slug', ctx.params.sensor_slug)
      .preload('tags')
      .first()

    if (!sensor) {
      throw new NotFoundException(
        `Cannot get unknown sensor '${ctx.params.sensor_slug}' of weather station '${ctx.params.slug}'`
      )
    }

    return {
      success: true,
      data: sensor,
    }
  }

  async readSensorOfStation(ctx: HttpContext) {
    const weather_station = await WeatherStation.query()
      .select('id')
      .where('slug', ctx.params.slug)
      .first()

    if (!weather_station) {
      throw new NotFoundException(
        `Cannot read from sensor of unknown weather station '${ctx.params.slug}'`
      )
    }

    const sensor = await Sensor.query()
      .where('weather_station_id', weather_station.id)
      .where('slug', ctx.params.sensor_slug)
      .select('id', 'value_type')
      .first()

    if (!sensor) {
      throw new NotFoundException(
        `Cannot read from unknown sensor '${ctx.params.sensor_slug}' of weather station '${ctx.params.slug}'`
      )
    }

    const record = await Record.query()
      .where('sensor_id', sensor.id)
      .orderBy('created_at', 'desc')
      .first()

    return {
      success: true,
      data: {
        value: record?.value_float ?? record?.value_int ?? null,
        created_at: record?.created_at ?? null,
      },
    }
  }

  async writeSensorOfStation(ctx: HttpContext) {
    const payload = await writeSensorValidator.validate(ctx.request.all())

    const weather_station = await WeatherStation.query()
      .select('id')
      .where('slug', ctx.params.slug)
      .first()

    if (!weather_station) {
      throw new NotFoundException(
        `Cannot write to sensor of unknown weather station '${ctx.params.slug}'`
      )
    }

    const sensor = await Sensor.query()
      .where('weather_station_id', weather_station.id)
      .where('slug', ctx.params.sensor_slug)
      .select('id', 'value_type')
      .first()

    if (!sensor) {
      throw new NotFoundException(
        `Cannot write to unknown sensor '${ctx.params.sensor_slug}' of weather station '${ctx.params.slug}'`
      )
    }

    await Record.create({
      created_at: payload.created_at ? DateTime.fromJSDate(payload.created_at) : DateTime.now(),
      sensor_id: sensor.id,
      value_float: sensor.value_type === 'double' ? payload.value : null,
      value_int: sensor.value_type === 'int' ? payload.value : null,
    })

    return {
      success: true,
    }
  }

  async readSensorSummaryOfStation(ctx: HttpContext) {
    const payload = await readSummaryValidator.validate(ctx.request.params())

    const weather_station = await WeatherStation.query()
      .select('id')
      .where('slug', payload.slug)
      .first()

    if (!weather_station) {
      throw new NotFoundException(
        `Cannot read from sensor of unknown weather station '${payload.slug}'`
      )
    }

    const sensor = await Sensor.query()
      .where('weather_station_id', weather_station.id)
      .where('slug', payload.sensor_slug)
      .select('id')
      .first()

    if (!sensor) {
      throw new NotFoundException(
        `Cannot read from unknown sensor '${payload.sensor_slug}' of weather station '${payload.slug}'`
      )
    }

    const summary = await Summary.query()
      .where('weather_station_id', weather_station.id)
      .andWhere('type', payload.interval)
      .orderBy('created_at', 'desc')
      .select('id', 'created_at')
      .firstOrFail()

    const record = await SummaryRecord.query()
      .where('sensor_id', sensor.id)
      .where('summary_id', summary.id)
      .first()

    return {
      success: true,
      data: {
        ...record?.data,
        created_at: summary.created_at,
      },
    }
  }
}
