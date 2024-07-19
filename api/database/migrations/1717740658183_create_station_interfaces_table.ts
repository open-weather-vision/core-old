import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'station_interfaces'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.string("repository_url", 200).primary(),
      table.string("slug").unique().notNullable(),
      table.string("dirname").unique().notNullable()
      table.jsonb("meta_information").notNullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}