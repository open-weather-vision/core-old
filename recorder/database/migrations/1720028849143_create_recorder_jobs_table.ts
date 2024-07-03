import { BaseSchema } from '@adonisjs/lucid/schema'

export type JobState = "active" | "inactive";
export const JobStates: JobState[] = ["active", "inactive"]

export default class extends BaseSchema {
  protected tableName = 'recorder_jobs'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string('station_slug').unique().notNullable()
      table.string('api_url').notNullable().defaultTo('http://localhost:3333/v1')
      table.string('username').notNullable().defaultTo('recorder')
      table.string('password').notNullable().defaultTo('recorder')
      table.enum('state', JobStates).notNullable().defaultTo("inactive")
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}