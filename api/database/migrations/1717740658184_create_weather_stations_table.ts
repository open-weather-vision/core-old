import { BaseSchema } from '@adonisjs/lucid/schema'
import { ActivityStates, ConnectionStates } from 'owvision-environment/types'

export default class extends BaseSchema {
  protected tableName = 'weather_stations'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string('slug', 50).unique().notNullable()
      table.string('name', 50).unique().notNullable()
      table
        .string('interface_slug', 200)
        .notNullable()
        .references('station_interfaces.slug')
        .onDelete('CASCADE')
        .onUpdate('CASCADE')
      table.jsonb('config_arguments').notNullable()
      table.enum('recorder_type', ['local', 'remote']).defaultTo('local').notNullable()
      table.enum('activity_state', ActivityStates).defaultTo('inactive').notNullable(),
        table.enum('connection_state', ConnectionStates).defaultTo('disconnected').notNullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
