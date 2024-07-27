import { BaseSchema } from '@adonisjs/lucid/schema'
import { TargetWeatherStationStates, WeatherStationStates } from 'owvision-environment/types'

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
      table.json('interface_config').defaultTo({}).notNullable()
      table.boolean('remote_recorder').defaultTo(false).notNullable()
      table.enum('target_state', TargetWeatherStationStates).defaultTo('inactive').notNullable(),
        table.enum('connection_state', WeatherStationStates).defaultTo('disconnected').notNullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
