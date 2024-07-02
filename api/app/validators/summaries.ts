import vine from '@vinejs/vine'
import { SummaryTypes } from '../other/summaries/summary_types.js'
import { ElevationUnits, HumidityUnits, PrecipationUnits, PressureUnits, SoilMoistureUnits, SolarRadiationUnits, TemperatureUnits, Units, WindUnits } from '../other/units/units.js'
export const get_latest_route_params_validator = vine.compile(
  vine.object({
    slug: vine.string(),
    sensor_slug: vine.string(),
  })
)

export const get_latest_query_params_validator = vine.compile(
  vine.object({
    type: vine.enum(SummaryTypes),
    unit: vine.enum(Units).optional(),
  })
)

export const get_one_route_params_validator = vine.compile(
  vine.object({
    slug: vine.string(),
    sensor_slug: vine.string(),
  })
)

export const get_one_query_params_validator = vine.compile(
  vine.object({
    year: vine.number().withoutDecimals().min(0),
    month: vine.number().withoutDecimals().min(1).max(12).optional(),
    day: vine.number().withoutDecimals().min(1).max(31).optional(),
    week: vine.number().withoutDecimals().min(1).optional(),
    hour: vine.number().withoutDecimals().min(0).max(23).optional(),
    unit: vine.enum(Units).optional(),
  })
)

export const get_one_of_multiple_sensors_route_params_validator = vine.compile(
  vine.object({
    slug: vine.string(),
  })
);

export const get_one_of_multiple_sensors_query_params_validator = vine.compile(
  vine.object({
    year: vine.number().withoutDecimals().min(0),
    month: vine.number().withoutDecimals().min(1).max(12).optional(),
    day: vine.number().withoutDecimals().min(1).max(31).optional(),
    week: vine.number().withoutDecimals().min(1).optional(),
    hour: vine.number().withoutDecimals().min(0).max(23).optional(),
    temperature_unit: vine.enum(TemperatureUnits).optional(),
    leaf_temperature_unit: vine.enum(TemperatureUnits).optional(),
    soil_temperature_unit: vine.enum(TemperatureUnits).optional(),
    precipation_unit: vine.enum(PrecipationUnits).optional(),
    evo_transpiration_unit: vine.enum(PrecipationUnits).optional(),
    pressure_unit: vine.enum(PressureUnits).optional(),
    elevation_unit: vine.enum(ElevationUnits).optional(),
    wind_unit: vine.enum(WindUnits).optional(),
    solar_radiation_unit: vine.enum(SolarRadiationUnits).optional(),
    soil_moisture_unit: vine.enum(SoilMoistureUnits).optional(),
    humidity_unit: vine.enum(HumidityUnits).optional()
  })
)



export const get_latest_of_multiple_sensors_route_params_validator = vine.compile(
  vine.object({
    slug: vine.string(),
  })
);

export const get_latest_of_multiple_sensors_query_params_validator = vine.compile(
  vine.object({
    type: vine.enum(SummaryTypes), 
    temperature_unit: vine.enum(TemperatureUnits).optional(),
    leaf_temperature_unit: vine.enum(TemperatureUnits).optional(),
    soil_temperature_unit: vine.enum(TemperatureUnits).optional(),
    precipation_unit: vine.enum(PrecipationUnits).optional(),
    evo_transpiration_unit: vine.enum(PrecipationUnits).optional(),
    pressure_unit: vine.enum(PressureUnits).optional(),
    elevation_unit: vine.enum(ElevationUnits).optional(),
    wind_unit: vine.enum(WindUnits).optional(),
    solar_radiation_unit: vine.enum(SolarRadiationUnits).optional(),
    soil_moisture_unit: vine.enum(SoilMoistureUnits).optional(),
    humidity_unit: vine.enum(HumidityUnits).optional()
  })
)