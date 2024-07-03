import { column } from '@adonisjs/lucid/orm'
import type { JobState } from '#database/migrations/1720028849143_create_recorder_jobs_table'
import AppBaseModel from './app_base_model.js'

export default class RecorderJob extends AppBaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare station_slug: string

  @column()
  declare state: JobState

  @column()
  declare api_url: string

  @column()
  declare username: string

  @column()
  declare password: string
}