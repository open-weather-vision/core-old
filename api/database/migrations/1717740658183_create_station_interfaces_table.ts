import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'station_interfaces'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.string("repository_url", 200).unique(),
      table.string("slug").primary(),
      table.string("dirname").unique()
      table.jsonb("meta_information")
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}