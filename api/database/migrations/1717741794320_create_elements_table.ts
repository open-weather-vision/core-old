import { BaseSchema } from '@adonisjs/lucid/schema'
import { ElementSummaryTypes } from 'owvision-environment/types'
import units from 'simple-units'

export default class extends BaseSchema {
  protected tableName = 'elements'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.string('slug', 30).primary()
      table.string('name', 50).notNullable()
      table.string('description', 255)
      table.enum('default_unit', units.possibilities())
      table.enum('internal_unit', units.possibilities())
      table.enum('unit_group', units.groups())
      table.enum('summary_type', ElementSummaryTypes).notNullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
