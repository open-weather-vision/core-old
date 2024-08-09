import { belongsTo, column, hasMany, hasOne } from '@adonisjs/lucid/orm'
import AppBaseModel from './app_base_model.js'
import type { ElementSummaryType } from 'owvision-environment/types'
import Sensor from './sensor.js'
import { HasMany } from '@adonisjs/lucid/types/relations'

export default class WeatherElement extends AppBaseModel {
  @column({ isPrimary: true })
  declare slug: string

  @column()
  declare name: string

  @column()
  declare description: string

  @column()
  declare default_unit: string | null

  @column()
  declare internal_unit: string | null

  @column()
  declare unit_group: string | null

  @column()
  declare summary_type: ElementSummaryType

  @hasMany(() => Sensor, {
    foreignKey: 'element_slug',
  })
  declare records: HasMany<typeof Sensor>
}
