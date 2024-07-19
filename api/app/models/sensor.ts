import { belongsTo, column, hasMany } from '@adonisjs/lucid/orm'
import type { SensorSummaryType } from 'owvision-environment/types'
import type { UnitType } from 'owvision-environment/units'
import WeatherStation from './weather_station.js'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import Record from './record.js'
import SensorTag from './sensor_tag.js'
import type { TimeUnit } from 'owvision-environment/scheduler'
import AppBaseModel from './app_base_model.js'

export type SensorValueType = 'double' | 'int'

export default class Sensor extends AppBaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare name: string

  @column()
  declare slug: string

  @column()
  declare summary_type: SensorSummaryType

  @column()
  declare interval: number

  @column()
  declare interval_unit: TimeUnit

  @column()
  declare unit_type: UnitType

  @column()
  declare weather_station_id: number

  @belongsTo(() => WeatherStation, {
    foreignKey: 'weather_station_id',
  })
  declare weather_station: BelongsTo<typeof WeatherStation>

  @hasMany(() => Record, {
    foreignKey: 'sensor_id',
  })
  declare records: HasMany<typeof Record>

  @hasMany(() => SensorTag, {
    foreignKey: 'sensor_id',
  })
  declare tags: HasMany<typeof SensorTag>

  get_type_information(): {
    max_summary: boolean
    min_summary: boolean
    avg_summary: boolean
    sum_summary: boolean
    latest_summary: boolean
    oldest_summary: boolean
    custom_summary: boolean
  } {
    return {
      max_summary: this.summary_type.includes('max'),
      min_summary: this.summary_type.includes('min'),
      avg_summary: this.summary_type.includes('avg'),
      sum_summary: this.summary_type === 'sum',
      latest_summary: this.summary_type === 'latest',
      oldest_summary: this.summary_type === 'oldest',
      custom_summary: this.summary_type === 'custom',
    }
  }
}
