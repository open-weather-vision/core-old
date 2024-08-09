import PleaseStopException from '#exceptions/please_stop_exception'
import SensorNotFoundException from '#exceptions/sensor_not_found_exception'
import StationNotFoundException from '#exceptions/station_not_found_exception'
import Record from '#models/record'
import Sensor from '#models/sensor'
import WeatherStation from '#models/weather_station'
import summary_creator_service from '../managers/summary_creator_service.js'
import { read_query_params_validator, write_validator } from '#validators/sensors'
import { HttpContext } from '@adonisjs/core/http'
import { errors } from '@vinejs/vine'

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
      throw new StationNotFoundException(ctx.params.slug)
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
      throw new StationNotFoundException(ctx.params.slug)
    }

    const sensor = await Sensor.query()
      .where('weather_station_id', weather_station.id)
      .where('slug', ctx.params.sensor_slug)
      .preload('tags')
      .first()

    if (!sensor) {
      throw new SensorNotFoundException(ctx.params.sensor_slug)
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
      throw new StationNotFoundException(ctx.params.slug)
    }

    const sensor = await Sensor.query()
      .where('weather_station_id', weather_station.id)
      .where('slug', ctx.params.sensor_slug)
      .select('id', 'unit_type')
      .first()

    if (!sensor) {
      throw new SensorNotFoundException(ctx.params.sensor_slug)
    }

    const record = await Record.query()
      .where('sensor_id', sensor.id)
      .orderBy('created_at', 'desc')
      .first()

    if (query_params.unit && record?.unit !== 'none') record?.convert_to(query_params.unit)

    return {
      success: true,
      data: {
        value: record?.value ?? null,
        created_at: record?.created_at ?? null,
        unit: record?.unit ?? null,
        meta_information: record?.meta_information,
      },
    }
  }

  async write(ctx: HttpContext) {
    const payload = await write_validator.validate(ctx.request.all())

    const weather_station = await WeatherStation.query()
      .select('id', 'target_state')
      .preload('unit_config')
      .where('slug', ctx.params.slug)
      .first()

    if (!weather_station) {
      throw new StationNotFoundException(ctx.params.slug)
    }

    if (weather_station.target_state === 'inactive') {
      throw new PleaseStopException()
    }

    const sensor = await Sensor.query()
      .where('weather_station_id', weather_station.id)
      .where('slug', ctx.params.sensor_slug)
      .select('id', 'unit_type')
      .first()

    if (!sensor) {
      throw new SensorNotFoundException(ctx.params.sensor_slug)
    }

    const raw_record = {
      created_at: payload.created_at,
      sensor_id: sensor.id,
      value: payload.value,
      unit: payload.unit,
    }

    const target_unit = weather_station.unit_config.of_type(sensor.unit_type)
    if (
      (raw_record.unit === 'none' && target_unit !== 'none' && raw_record.value !== null) ||
      (target_unit === 'none' && raw_record.unit !== 'none')
    ) {
      throw new errors.E_VALIDATION_ERROR([`Invalid unit '${raw_record.unit}'!`])
    }

    const record = await Record.create_with_target_unit(raw_record, target_unit)

    const result = await summary_creator_service.process_record(ctx.params.slug, record)

    return {
      success: result,
    }
  }
}
