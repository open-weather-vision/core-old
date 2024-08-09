import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'sensors'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string('slug', 50).index()
      table.string('name', 50).notNullable()
      table.string('description', 255).notNullable()
      table
        .integer('weather_station_id')
        .notNullable()
        .references('weather_stations.id')
        .onUpdate('CASCADE')
        .onDelete('CASCADE')
      table.string('record_interval').notNullable()
      table.string('element_slug').references('elements.slug')
      table.unique(['slug', 'weather_station_id'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
