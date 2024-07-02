// import type { HttpContext } from '@adonisjs/core/http'

import NotFoundException from '#exceptions/not_found_exception'
import UnitConfig from '#models/unit_config'
import WeatherStation from '#models/weather_station'
import { initializeWeatherStationValidator } from '#validators/weather_stations'
import { HttpContext } from '@adonisjs/core/http'
import Sensor from '#models/sensor'
import summary_creator_service from '../services/summary_creator_service.js'
import recorder_service from '#services/recorder_service'
import * as fs from 'fs'
import { WeatherStationInterface } from '../other/weather_station_interface.js'
import { Exception } from '@adonisjs/core/exceptions'

export default class WeatherStationsController {
  async get_interface(ctx: HttpContext) {
    const data = await WeatherStation.query().where('slug', ctx.params.slug).first()

    if (data == null) {
      throw new NotFoundException(`No weather station with name '${ctx.params.slug}' exists!`)
    }

    const interface_name = data?.interface

    const interface_file = fs.createReadStream(`./interfaces/${interface_name}.js`)

    ctx.response.stream(interface_file)
  }

  async get_all(ctx: HttpContext) {
    const data = await WeatherStation.query().select('slug', 'name', 'interface', 'state')

    if (data == null) {
      throw new NotFoundException(`No weather station with name '${ctx.params.slug}' exists!`)
    }

    return {
      success: true,
      data,
    }
  }

  async get_one(ctx: HttpContext) {
    const data = await WeatherStation.query()
      .preload('unit_config')
      .where('slug', ctx.params.slug)
      .first()

    const serializedData = data?.serialize()

    if (data == null) {
      throw new NotFoundException(`No weather station with name '${ctx.params.slug}' exists!`)
    }

    return {
      success: true,
      data: serializedData,
    }
  }

  async initialize(ctx: HttpContext) {
    const data = ctx.request.all()
    const payload = await initializeWeatherStationValidator.validate(data)

    const weather_station = await WeatherStation.create({
      interface: payload.interface,
      interface_config: payload.interface_config,
      name: payload.name,
      slug: payload.slug,
      state: 'disconnected',
      remote_recorder: payload.remote_recorder,
    })

    if (payload.units) {
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
    }

    let StationInterface
    try {
      StationInterface = await weather_station.interface_class
    } catch (err) {
      await weather_station.delete()
      throw new Exception(`Passed interface '${payload.interface}' is not installed!`, {
        status: 400,
        code: 'unkown-interface-error',
      })
    }
    const station_interface: WeatherStationInterface = new StationInterface(
      payload.interface_config
    )

    for (const sensor_slug in station_interface.sensors) {
      const sensor = station_interface.sensors[sensor_slug]
      await Sensor.create({
        ...sensor,
        weather_station_id: weather_station.id,
        slug: sensor_slug,
      })
    }

    // Add station to summary creator / recorder service
    summary_creator_service.add_station(weather_station)
    if (!payload.remote_recorder) {
      recorder_service.add_station(weather_station)
    }

    return {
      success: true,
    }
  }
}
