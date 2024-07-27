import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'units'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.string('unit', 20).primary()
      table
        .string('group_slug')
        .references('unit_groups.slug')
        .onDelete('CASCADE')
        .onUpdate('CASCADE')
        .notNullable()
      table.double('ratio')
      table.double('offset')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
