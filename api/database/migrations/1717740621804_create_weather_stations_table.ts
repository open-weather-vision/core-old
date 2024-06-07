import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'weather_stations'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string('name', 50).unique()
      table.string('interface', 50).notNullable()
      table.json('interface_config').defaultTo({}).notNullable()

      table
        .integer('unit_config_id')
        .notNullable()
        .references('unit_configs.id')
        .onDelete('CASCADE')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
