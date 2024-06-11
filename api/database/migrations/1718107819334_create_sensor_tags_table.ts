import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'sensor_tags'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table
        .integer('sensor_id')
        .notNullable()
        .references('sensors.id')
        .onDelete('CASCADE')
        .onUpdate('CASCADE')
      table.string('tag', 50).notNullable()
      table.unique(['sensor_id', 'tag'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
