import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'unit_groups'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.string('slug', 30).primary()
      table.string('name', 50).notNullable()
      table.string('base_unit').references('units.unit').nullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
