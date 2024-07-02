import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import type {
  ElevationUnit,
  HumidityUnit,
  PrecipationUnit,
  PressureUnit,
  SoilMoistureUnit,
  SolarRadiationUnit,
  TemperatureUnit,
  Unit,
  UnitType,
  WindUnit,
} from '../other/units/units.js'
import WeatherStation from './weather_station.js'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import AppBaseModel from './app_base_model.js'
import { Exception } from '@adonisjs/core/exceptions'

export default class UnitConfig extends AppBaseModel {
  @column({ isPrimary: true, serializeAs: null })
  declare id: number

  @column()
  declare temperature_unit: TemperatureUnit

  @column()
  declare leaf_temperature_unit: TemperatureUnit

  @column()
  declare soil_temperature_unit: TemperatureUnit

  @column()
  declare precipation_unit: PrecipationUnit

  @column()
  declare evo_transpiration_unit: PrecipationUnit

  @column()
  declare pressure_unit: PressureUnit

  @column()
  declare elevation_unit: ElevationUnit

  @column()
  declare wind_unit: WindUnit

  @column()
  declare solar_radiation_unit: SolarRadiationUnit

  @column()
  declare soil_moisture_unit: SoilMoistureUnit

  @column()
  declare humidity_unit: HumidityUnit

  @column({ serializeAs: null })
  declare weather_station_id: number

  @belongsTo(() => WeatherStation, {
    foreignKey: 'weather_station_id',
  })
  declare weather_station: BelongsTo<typeof WeatherStation>

  of_type(type: UnitType): Unit | 'none' {
    if (type === 'none') return 'none'
    else {
      const result = this[`${type}_unit`];
      if(result === undefined){
        throw new Exception(`'${type}' is an invalid unit type!`);
      }
      return result;
    } 
  }
}
