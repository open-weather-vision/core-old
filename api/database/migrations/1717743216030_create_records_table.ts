import { BaseSchema } from '@adonisjs/lucid/schema'
import units from 'simple-units'

export default class extends BaseSchema {
  protected tableName = 'records'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table
        .integer('sensor_id')
        .notNullable()
        .references('sensors.id')
        .onDelete('CASCADE')
        .onUpdate('CASCADE')
      table.jsonb('value')
      table.enum('unit', units.possibilities()).nullable()
      table.timestamp('created_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
