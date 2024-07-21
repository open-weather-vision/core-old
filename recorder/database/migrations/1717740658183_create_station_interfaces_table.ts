import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'station_interfaces'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.string("slug").primary(),
      table.jsonb("meta_information")
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}