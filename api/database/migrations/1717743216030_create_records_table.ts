import { BaseSchema } from '@adonisjs/lucid/schema'
import { Units } from 'owvision-environment/units'

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
      table.jsonb('meta_information')
      table.timestamp('created_at')
      table.enum('unit', [...Units, 'none']).notNullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
