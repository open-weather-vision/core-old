import UnitConfig from '#models/unit_config'
import WeatherStation from '#models/weather_station'
import {
  connection_state_validator,
  initialize_weather_station_validator,
} from '#validators/weather_stations'
import type { HttpContext } from '@adonisjs/core/http'
import Sensor from '#models/sensor'
import summary_creator_service from '../services/summary_creator_service.js'
import StationNotFoundException from '#exceptions/station_not_found_exception'
import logger from '@adonisjs/core/services/logger'
import local_jobs_service from '#services/local_jobs_service'
import InterfaceNotFoundException from '#exceptions/interface_not_found_exception'
import { fromIntervalString } from 'owvision-environment/scheduler'
import StationInterface from '#models/station_interface'
import { validate_config } from 'owvision-environment/interfaces'
import ConfigValidationException from '#exceptions/config_validation_exception'

export default class WeatherStationsController {
  async delete(ctx: HttpContext) {
    const station = await WeatherStation.query().where('slug', ctx.params.slug).first()

    if (!station) {
      throw new StationNotFoundException(ctx.params.slug)
    }

    await station.delete()

    return {
      success: true,
    }
  }

  async pause(ctx: HttpContext) {
    const station = await WeatherStation.query().where('slug', ctx.params.slug).first()

    if (station == null) {
      throw new StationNotFoundException(ctx.params.slug)
    }

    station.target_state = 'inactive'
    await station.save()

    return {
      success: true,
    }
  }

  async resume(ctx: HttpContext) {
    const station = await WeatherStation.query().where('slug', ctx.params.slug).first()

    if (station == null) {
      throw new StationNotFoundException(ctx.params.slug)
    }

    station.target_state = 'active'
    await station.save()

    return {
      success: true,
    }
  }

  async get_station_target_state(ctx: HttpContext) {
    const station = await WeatherStation.query().where('slug', ctx.params.slug).first()

    if (station == null) {
      throw new StationNotFoundException(ctx.params.slug)
    }

    return {
      success: true,
      data: station.target_state,
    }
  }

  async get_station_connection_state(ctx: HttpContext) {
    const station = await WeatherStation.query().where('slug', ctx.params.slug).first()

    if (station == null) {
      throw new StationNotFoundException(ctx.params.slug)
    }

    return {
      success: true,
      data: station.connection_state,
    }
  }

  async set_station_connection_state(ctx: HttpContext) {
    const payload = await ctx.request.validateUsing(connection_state_validator)
    const station = await WeatherStation.query().where('slug', ctx.params.slug).first()

    if (station == null) {
      throw new StationNotFoundException(ctx.params.slug)
    }

    station.connection_state = payload.connection_state
    await station.save()

    return {
      success: true,
    }
  }

  async get_all() {
    const data = await WeatherStation.query()
      .select(
        'slug',
        'name',
        'interface_slug',
        'target_state',
        'connection_state',
        'remote_recorder'
      )
      .orderBy('name')
      .exec()

    return {
      success: true,
      data,
    }
  }

  async get_one(ctx: HttpContext) {
    const station = await WeatherStation.query()
      .preload('unit_config')
      .where('slug', ctx.params.slug)
      .first()

    if (station == null) {
      throw new StationNotFoundException(ctx.params.slug)
    }

    return {
      success: true,
      data: station,
    }
  }

  async initialize(ctx: HttpContext) {
    const data = ctx.request.all()
    const payload = await initialize_weather_station_validator.validate(data)

    const station_interface = await StationInterface.query()
      .where('slug', payload.interface_slug)
      .first()
    if (!station_interface) {
      throw new InterfaceNotFoundException(payload.interface_slug)
    }

    // Validate config
    if (payload.interface_config) {
      try {
        validate_config(station_interface.meta_information.config!, payload.interface_config)
      } catch (err) {
        throw new ConfigValidationException(err.message)
      }
    } else {
      payload.interface_config = station_interface.meta_information.config as any
    }

    const weather_station = await WeatherStation.create({
      interface_slug: payload.interface_slug,
      interface_config: payload.interface_config,
      name: payload.name,
      slug: payload.slug,
      target_state: payload.target_state ?? 'inactive',
      connection_state: payload.target_state === 'active' ? 'connecting' : 'disconnected',
      remote_recorder: payload.remote_recorder,
    })

    await UnitConfig.create({
      elevation_unit: payload.units.elevation,
      evo_transpiration_unit: payload.units.evo_transpiration,
      humidity_unit: payload.units.humidity,
      leaf_temperature_unit: payload.units.leaf_temperature,
      temperature_unit: payload.units.temperature,
      solar_radiation_unit: payload.units.solar_radiation,
      soil_moisture_unit: payload.units.soil_moisture,
      precipation_unit: payload.units.precipation,
      pressure_unit: payload.units.pressure,
      soil_temperature_unit: payload.units.soil_temperature,
      wind_unit: payload.units.wind,
      weather_station_id: weather_station.id,
    })

    for (const sensor of station_interface.meta_information.sensors) {
      let record_interval
      if (typeof sensor.record_interval === 'string') {
        record_interval = fromIntervalString(sensor.record_interval)
      } else {
        record_interval = fromIntervalString(sensor.record_interval.default)
      }
      await Sensor.create({
        name: sensor.name,
        summary_type: sensor.summary_type,
        interval: record_interval.value,
        interval_unit: record_interval.unit,
        weather_station_id: weather_station.id,
        unit_type: sensor.unit_type,
        slug: sensor.slug,
      })
    }

    // Add station to summary creator / recorder service
    summary_creator_service.add_station(weather_station)

    // Start local recorder
    if (!payload.remote_recorder) {
      await local_jobs_service.create_and_start_local_job(payload.slug)
    }

    logger.info(`Created new station '${payload.slug}' with interface '${station_interface.slug}'!`)
    return {
      success: true,
    }
  }
}
