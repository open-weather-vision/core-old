import { BaseSchema } from '@adonisjs/lucid/schema'
import { SummaryTypes } from '../../app/utils/summaries/summary_types.js'

export default class extends BaseSchema {
  protected tableName = 'summaries'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.enum('type', SummaryTypes)
      table.timestamp('created_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
