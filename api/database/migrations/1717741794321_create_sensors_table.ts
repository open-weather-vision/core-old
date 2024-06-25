import { BaseSchema } from '@adonisjs/lucid/schema'
import { SensorSummaryTypes } from '../../app/other/summaries/summary_types.js'
import { UnitTypes } from '../../app/other/units/units.js'
import { TimeUnits } from '../../app/other/scheduler.js'

export default class extends BaseSchema {
  protected tableName = 'sensors'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string('slug', 50).index()
      table.string('name', 50)
      table
        .integer('weather_station_id')
        .notNullable()
        .references('weather_stations.id')
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
