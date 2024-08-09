import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'station_interfaces'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.string('repository_url', 200).unique(),
        table.string('slug').primary(),
        table.string('description', 500),
        table.string('author', 100).nullable(),
        table.string('name', 255),
        table.string('entrypoint', 255)
      table.jsonb('config_arguments'), table.jsonb('commands'), table.jsonb('sensors')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
