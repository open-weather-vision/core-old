// import type { HttpContext } from '@adonisjs/core/http'

import Sensor from '#models/sensor'
import Summary from '#models/summary'
import SummaryRecord from '#models/summary_record'
import WeatherStation from '#models/weather_station'
import { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import { TimeUnit } from 'owvision-environment/scheduler'
import {
  get_latest_of_multiple_sensors_query_params_validator,
  get_latest_of_multiple_sensors_route_params_validator,
  get_latest_query_params_validator,
  get_latest_route_params_validator,
  get_one_of_multiple_sensors_query_params_validator,
  get_one_of_multiple_sensors_route_params_validator,
  get_one_query_params_validator,
  get_one_route_params_validator,
} from '#validators/summaries'
import StationNotFoundException from '#exceptions/station_not_found_exception'
import SummaryNotFoundException from '#exceptions/summary_not_found_exception'
import SensorNotFoundException from '#exceptions/sensor_not_found_exception'

export default class SummariesController {
  async get_one_of_multiple_sensors(ctx: HttpContext) {
    const params = await get_one_of_multiple_sensors_route_params_validator.validate(
      ctx.request.params()
    )
    const query = await get_one_of_multiple_sensors_query_params_validator.validate(
      ctx.request.qs()
    )

    const weather_station = await WeatherStation.query()
      .select('id')
      .where('slug', params.slug)
      .first()

    if (!weather_station) {
      throw new StationNotFoundException(params.slug)
    }

    let type: TimeUnit
    if (query.hour !== undefined) type = 'hour'
    else if (query.day !== undefined) type = 'day'
    else if (query.week !== undefined) type = 'week'
    else if (query.month !== undefined) type = 'month'
    else type = 'year'

    let start_date: DateTime
    if (type === 'week') {
      start_date = DateTime.local(query.year, 1, 1).set({
        localWeekNumber: query.week,
        localWeekday: 1,
      })
    } else {
      start_date = DateTime.local(query.year, query.month ?? 1, query.day ?? 1).set({
        hour: query.hour ?? 0,
        minute: 0,
        second: 0,
        millisecond: 0,
      })
    }
    const stop_date = start_date.plus({ [type]: 1 })

    const summary = await Summary.query()
      .where('weather_station_id', weather_station.id)
      .andWhere('type', type)
      .andWhere('created_at', '>=', start_date.toBSON())
      .andWhere('created_at', '<', stop_date.toBSON())
      .select('id', 'created_at')
      .first()

    if (!summary) {
      throw new SummaryNotFoundException()
    }

    const records = await SummaryRecord.query()
      .where('summary_id', summary.id)
      .preload('sensor')
      .orderBy('sensor_id')
      .exec()

    for (const record of records) {
      const unit_type = record.sensor.unit_type
      if (unit_type !== 'none' && unit_type !== 'LWI' && unit_type !== 'UV') {
        const target_unit = query[`${unit_type}_unit`]
        const record_unit = record.unit

        if (target_unit && record_unit !== 'none') {
          record.convert_to(target_unit)
        }
      }
    }

    return {
      success: true,
      data: {
        records: records.map((record) => ({
          ...record.data,
          sensor_slug: record.sensor.slug,
          sensor_name: record.sensor.name,
          summary_type: record.sensor.summary_type,
          unit: record.unit,
        })),
        created_at: summary.created_at,
      },
    }
  }

  async get_latest_of_multiple_sensors(ctx: HttpContext) {
    const params = await get_latest_of_multiple_sensors_route_params_validator.validate(
      ctx.request.params()
    )
    const query = await get_latest_of_multiple_sensors_query_params_validator.validate(
      ctx.request.qs()
    )

    const weather_station = await WeatherStation.query()
      .select('id')
      .where('slug', params.slug)
      .first()

    if (!weather_station) {
      throw new StationNotFoundException(params.slug)
    }

    const summary = await Summary.query()
      .where('weather_station_id', weather_station.id)
      .andWhere('type', query.type)
      .orderBy('created_at', 'desc')
      .select('id', 'created_at')
      .firstOrFail()

    if (!summary) {
      throw new SummaryNotFoundException()
    }

    const records = await SummaryRecord.query()
      .where('summary_id', summary.id)
      .preload('sensor')
      .orderBy('sensor_id')
      .exec()

    for (const record of records) {
      const unit_type = record.sensor.unit_type
      if (unit_type !== 'none' && unit_type !== 'LWI' && unit_type !== 'UV') {
        const target_unit = query[`${unit_type}_unit`]
        const record_unit = record.unit

        if (target_unit && record_unit !== 'none') {
          record.convert_to(target_unit)
        }
      }
    }

    return {
      success: true,
      data: {
        records: records.map((record) => ({
          ...record.data,
          sensor_slug: record.sensor.slug,
          sensor_name: record.sensor.name,
          summary_type: record.sensor.summary_type,
          unit: record.unit,
        })),
        created_at: summary.created_at,
      },
    }
  }

  async get_one(ctx: HttpContext) {
    const params = await get_one_route_params_validator.validate(ctx.request.params())
    const query = await get_one_query_params_validator.validate(ctx.request.qs())

    const weather_station = await WeatherStation.query()
      .select('id')
      .where('slug', params.slug)
      .first()

    if (!weather_station) {
      throw new StationNotFoundException(params.slug)
    }
    const sensor = await Sensor.query()
      .where('weather_station_id', weather_station.id)
      .where('slug', params.sensor_slug)
      .select('id')
      .first()

    if (!sensor) {
      throw new SensorNotFoundException(params.sensor_slug)
    }

    let type: TimeUnit
    if (query.hour !== undefined) type = 'hour'
    else if (query.day !== undefined) type = 'day'
    else if (query.week !== undefined) type = 'week'
    else if (query.month !== undefined) type = 'month'
    else type = 'year'

    let start_date: DateTime
    if (type === 'week') {
      start_date = DateTime.local(query.year, 1, 1).set({
        localWeekNumber: query.week,
        localWeekday: 1,
      })
    } else {
      start_date = DateTime.local(query.year, query.month ?? 1, query.day ?? 1).set({
        hour: query.hour ?? 0,
        minute: 0,
        second: 0,
        millisecond: 0,
      })
    }
    const stop_date = start_date.plus({ [type]: 1 })

    const summary = await Summary.query()
      .where('weather_station_id', weather_station.id)
      .andWhere('type', type)
      .andWhere('created_at', '>=', start_date.toBSON())
      .andWhere('created_at', '<', stop_date.toBSON())
      .select('id', 'created_at')
      .first()

    if (!summary) {
      throw new SummaryNotFoundException()
    }

    const record = await SummaryRecord.query()
      .where('sensor_id', sensor.id)
      .where('summary_id', summary.id)
      .first()

    if (!record) {
      return {
        success: false,
      }
    }

    if (query.unit) record.convert_to(query.unit)

    return {
      success: true,
      data: {
        ...record.data,
        sensor_slug: record.sensor.slug,
        sensor_name: record.sensor.name,
        summary_type: record.sensor.summary_type,
        unit: record.unit,
        created_at: summary.created_at,
      },
    }
  }

  async get_latest_one(ctx: HttpContext) {
    const params = await get_latest_route_params_validator.validate(ctx.request.params())
    const query = await get_latest_query_params_validator.validate(ctx.request.qs())

    const weather_station = await WeatherStation.query()
      .select('id')
      .where('slug', params.slug)
      .first()

    if (!weather_station) {
      throw new StationNotFoundException(params.slug)
    }

    const sensor = await Sensor.query()
      .where('weather_station_id', weather_station.id)
      .where('slug', params.sensor_slug)
      .select('id')
      .first()

    if (!sensor) {
      throw new SensorNotFoundException(params.sensor_slug)
    }

    const summary = await Summary.query()
      .where('weather_station_id', weather_station.id)
      .andWhere('type', query.type)
      .orderBy('created_at', 'desc')
      .select('id', 'created_at')
      .firstOrFail()

    const record = await SummaryRecord.query()
      .where('sensor_id', sensor.id)
      .where('summary_id', summary.id)
      .first()

    if (!record) {
      return {
        success: false,
      }
    }

    if (query.unit) record.convert_to(query.unit)

    return {
      success: true,
      data: {
        ...record.data,
        sensor_slug: record.sensor.slug,
        sensor_name: record.sensor.name,
        summary_type: record.sensor.summary_type,
        unit: record.unit,
        created_at: summary.created_at,
      },
    }
  }
}
