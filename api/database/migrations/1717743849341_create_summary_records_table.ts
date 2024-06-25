import { BaseSchema } from '@adonisjs/lucid/schema'
import { Units } from '../../app/other/units/units.js'

export default class extends BaseSchema {
  protected tableName = 'summary_records'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table
        .integer('sensor_id')
        .notNullable()
        .references('sensors.id')
        .onDelete('CASCADE')
        .onUpdate('CASCADE')
      table
        .integer('summary_id')
        .notNullable()
        .references('summaries.id')
        .onDelete('CASCADE')
        .onUpdate('CASCADE')
        .index()
      table.jsonb('data')
      table.enum('unit', [...Units, 'none']).notNullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
