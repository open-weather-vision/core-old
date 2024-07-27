import { BaseSchema } from '@adonisjs/lucid/schema'
import { SummaryTypes } from 'owvision-environment/types'

export default class extends BaseSchema {
  protected tableName = 'elements'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.string('slug', 30).primary()
      table.string('name', 50).notNullable()
      table
        .string('unit_group')
        .references('unit_groups.slug')
        .onDelete('CASCADE')
        .onUpdate('CASCADE')
        .notNullable()
      table.enum('summary_type', SummaryTypes)
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
