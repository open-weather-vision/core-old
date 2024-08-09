import { BaseSchema } from '@adonisjs/lucid/schema'
import { SummaryIntervals } from 'owvision-environment/types'

export default class extends BaseSchema {
  protected tableName = 'summaries'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.enum('interval', SummaryIntervals)
      table
        .integer('weather_station_id')
        .notNullable()
        .references('weather_stations.id')
        .onDelete('CASCADE')
        .onUpdate('CASCADE')
      table.timestamp('created_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
