import { Roles } from 'owvision-environment/types'
import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'users'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string('name', 50).unique().notNullable()
      table.string('password').notNullable(), table.enum('role', Roles).notNullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
