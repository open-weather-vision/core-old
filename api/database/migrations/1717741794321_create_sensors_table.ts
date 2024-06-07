import { BaseSchema } from '@adonisjs/lucid/schema'
import { SensorSummaryTypes } from '../../app/utils/summaries/summary_types.js'
import { UnitTypes } from '../../app/utils/units/units.js'

export default class extends BaseSchema {
  protected tableName = 'sensors'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string('name', 50).index()
      table.integer('weather_station_id').notNullable().references('weather_stations.id')
      table.enum('summary_type', SensorSummaryTypes).notNullable()
      table.integer('record_interval_seconds').notNullable()
      table.enum('unit_type', UnitTypes).notNullable()
      table.enum('value_type', ['int', 'double'])
      table.unique(['name', 'weather_station_id'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
