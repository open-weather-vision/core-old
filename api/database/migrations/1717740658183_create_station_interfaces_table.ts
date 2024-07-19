import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'station_interfaces'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.string("slug", 50).primary(),
      table.string("description", 200).notNullable().defaultTo("This interface has no description.")
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}