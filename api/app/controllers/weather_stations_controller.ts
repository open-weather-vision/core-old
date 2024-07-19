// import type { HttpContext } from '@adonisjs/core/http'

import UnitConfig from '#models/unit_config'
import WeatherStation from '#models/weather_station'
import { initialize_weather_station_validator } from '#validators/weather_stations'
import { HttpContext } from '@adonisjs/core/http'
import Sensor from '#models/sensor'
import summary_creator_service from '../services/summary_creator_service.js'
import * as fs from 'fs'
import { WeatherStationInterface } from "owvision-environment/interfaces"
import { Exception } from '@adonisjs/core/exceptions'
import StationNotFoundException from '#exceptions/station_not_found_exception'
import logger from '@adonisjs/core/services/logger'
import local_jobs_service from '#services/local_jobs_service'
import StationInterface from '#models/station_interface'
import InterfaceNotFoundException from '#exceptions/interface_not_found_exception'

export default class WeatherStationsController {
  async delete(ctx: HttpContext) {
    const station = await WeatherStation.query()
      .where('slug', ctx.params.slug)
      .first();

    if (!station) {
      throw new StationNotFoundException(ctx.params.slug);
    }

    await station.delete();

    return {
      success: true,
    }
  }
  
  async pause(ctx: HttpContext) {
    const station = await WeatherStation.query()
      .where('slug', ctx.params.slug)
      .first();

    if (station == null) {
      throw new StationNotFoundException(ctx.params.slug)
    }

    station.state = 'inactive'
    await station.save();

    return {
      success: true,
    }
  }

  async resume(ctx: HttpContext) {
    const station = await WeatherStation.query()
      .where('slug', ctx.params.slug)
      .first();

    if (station == null) {
      throw new StationNotFoundException(ctx.params.slug)
    }

    station.state = 'active'
    await station.save();

    return {
      success: true,
    }
  }

  async get_station_state(ctx: HttpContext) {
    const station = await WeatherStation.query().where('slug', ctx.params.slug).first()

    if (station == null) {
      throw new StationNotFoundException(ctx.params.slug)
    }

    return {
      success: true,
      data: station.state,
    }
  }


  async get_interface(ctx: HttpContext) {
    const station = await WeatherStation.query().where('slug', ctx.params.slug).first()

    if (station == null) {
      throw new StationNotFoundException(ctx.params.slug)
    }

    const interface_name = station?.interface

    const interface_file = fs.createReadStream(`./interfaces/${interface_name}.js`)

    ctx.response.stream(interface_file)
  }

  async get_all() {
    const data = await WeatherStation.query().select('slug', 'name', 'interface', 'state', 'remote_recorder')

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

    const serializedData = station?.serialize()

    if (station == null) {
      throw new StationNotFoundException(ctx.params.slug)
    }

    return {
      success: true,
      data: serializedData,
    }
  }

  async initialize(ctx: HttpContext) {
    const data = ctx.request.all()
    const payload = await initialize_weather_station_validator.validate(data)

    const station_interface = await StationInterface.query().where("repository_url", payload.interface_url).first();
    if(!station_interface){
      throw new InterfaceNotFoundException(payload.interface_url);
    }

    const weather_station = await WeatherStation.create({
      interface_url: payload.interface_url,
      interface_config: payload.interface_config,
      name: payload.name,
      slug: payload.slug,
      state: payload.state ?? 'inactive',
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
      await Sensor.create({
        name: sensor.name,
        summary_type: sensor.summary_type,
        
        weather_station_id: weather_station.id,
        slug: sensor.slug,
      })
    }

    // Add station to summary creator / recorder service
    summary_creator_service.add_station(weather_station)


    if (!payload.remote_recorder) {
      await local_jobs_service.create_and_start_local_job(payload.slug);
    }

    logger.info(`Created new station '${payload.slug}'!`)
    return {
      success: true,
    }
  }
}
