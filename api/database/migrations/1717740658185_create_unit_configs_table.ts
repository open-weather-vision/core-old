import { BaseSchema } from '@adonisjs/lucid/schema'
import {
  PressureUnits,
  PrecipationUnits,
  TemperatureUnits,
  ElevationUnits,
  WindUnits,
  SolarRadiationUnits,
  SoilMoistureUnits,
  HumidityUnits,
} from '../../app/utils/units/units.js'

export default class extends BaseSchema {
  protected tableName = 'unit_configs'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()
      table.enum('temperature_unit', TemperatureUnits).notNullable()
      table.enum('leaf_temperature_unit', TemperatureUnits).notNullable()
      table.enum('soil_temperature_unit', TemperatureUnits).notNullable()
      table.enum('precipation_unit', PrecipationUnits).notNullable()
      table.enum('evo_transpiration_unit', PrecipationUnits).notNullable()
      table.enum('pressure_unit', PressureUnits).notNullable()
      table.enum('elevation_unit', ElevationUnits).notNullable()
      table.enum('wind_unit', WindUnits).notNullable()
      table.enum('solar_radiation_unit', SolarRadiationUnits).notNullable()
      table.enum('soil_moisture_unit', SoilMoistureUnits).notNullable()
      table.enum('humidity_unit', HumidityUnits).notNullable()
      table.boolean('global').defaultTo(false)
      table.integer('weather_station_id').references('weather_stations.id').onDelete('CASCADE')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
