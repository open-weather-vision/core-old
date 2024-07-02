import vine from '@vinejs/vine'
import {
  ElevationUnits,
  HumidityUnits,
  PrecipationUnits,
  PressureUnits,
  SoilMoistureUnits,
  SolarRadiationUnits,
  TemperatureUnits,
  WindUnits,
} from '../other/units/units.js'
import { WeatherStationStates } from '#models/weather_station'

export const initialize_weather_station_validator = vine.compile(
  vine.object({
    name: vine.string().trim().maxLength(50),
    slug: vine
      .string()
      .trim()
      .alphaNumeric({
        allowDashes: true,
        allowSpaces: false,
        allowUnderscores: true,
      })
      .maxLength(50),
    units: vine
      .object({
        temperature: vine.enum(TemperatureUnits),
        leaf_temperature: vine.enum(TemperatureUnits),
        soil_temperature: vine.enum(TemperatureUnits),
        precipation: vine.enum(PrecipationUnits),
        evo_transpiration: vine.enum(PrecipationUnits),
        pressure: vine.enum(PressureUnits),
        elevation: vine.enum(ElevationUnits),
        wind: vine.enum(WindUnits),
        solar_radiation: vine.enum(SolarRadiationUnits),
        soil_moisture: vine.enum(SoilMoistureUnits),
        humidity: vine.enum(HumidityUnits),
      }),
    interface: vine.string().trim().minLength(1).maxLength(50),
    interface_config: vine.object({}).allowUnknownProperties(),
    remote_recorder: vine.boolean(),
    state: vine.enum(WeatherStationStates).optional()
  })
)
