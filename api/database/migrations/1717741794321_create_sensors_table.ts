import { BaseSchema } from '@adonisjs/lucid/schema'
import { SensorSummaryTypes } from 'owvision-environment/types'
import { UnitTypes } from 'owvision-environment/units'
import { TimeUnits } from 'owvision-environment/scheduler'

export default class extends BaseSchema {
  protected tableName = 'sensors'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string('slug', 50).index()
      table.string('name', 50).notNullable()
      table
        .integer('weather_station_id')
        .notNullable()
        .references('weather_stations.id')
        .onUpdate('CASCADE')
        .onDelete('CASCADE')
      table.enum('summary_type', SensorSummaryTypes).notNullable()
      table.integer('interval').notNullable()
      table.enum('interval_unit', TimeUnits).notNullable()
      table.enum('unit_type', UnitTypes).notNullable()
      table.unique(['name', 'weather_station_id'])
      table.unique(['slug', 'weather_station_id'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
