import NotFoundException from '#exceptions/not_found_exception'
import Record from '#models/record'
import Sensor from '#models/sensor'
import WeatherStation from '#models/weather_station'
import summary_creator_service from '#services/summary_creator_service'
import { read_query_params_validator, write_validator } from '#validators/sensors'
import { HttpContext } from '@adonisjs/core/http'
import logger from '@adonisjs/core/services/logger'
import { DateTime } from 'luxon'

export default class SensorsController {
  async get_all_of_station(ctx: HttpContext) {
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

  async get_one_of_station(ctx: HttpContext) {
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

  async read(ctx: HttpContext) {
    const query_params = await read_query_params_validator.validate(ctx.request.qs())

    const weather_station = await WeatherStation.query()
      .preload('unit_config')
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
      .select('id', 'unit_type')
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

    if (query_params.unit) record?.convert_to(query_params.unit)

    return {
      success: true,
      data: {
        value: record?.value ?? null,
        created_at: record?.created_at ?? null,
      },
    }
  }

  async write(ctx: HttpContext) {
    const payload = await write_validator.validate(ctx.request.all())

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
      .select('id')
      .first()

    if (!sensor) {
      throw new NotFoundException(
        `Cannot write to unknown sensor '${ctx.params.sensor_slug}' of weather station '${ctx.params.slug}'`
      )
    }

    const record = await Record.create({
      created_at: payload.created_at,
      sensor_id: sensor.id,
      value: payload.value,
      unit: payload.unit,
    })

    summary_creator_service.process_record(ctx.params.slug, record)

    return {
      success: true,
    }
  }
}
