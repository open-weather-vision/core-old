import { belongsTo, column, hasMany } from '@adonisjs/lucid/orm'
import WeatherStation from './weather_station.js'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import Record from './record.js'
import SensorTag from './sensor_tag.js'
import AppBaseModel from './app_base_model.js'
import SummaryRecord from './summary_record.js'
import WeatherElement from './weather_element.js'

export type SensorValueType = 'double' | 'int'

export default class Sensor extends AppBaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare slug: string

  @column()
  declare name: string

  @column()
  declare description: string

  @column()
  declare record_interval: string

  @column()
  declare element_slug: string

  @belongsTo(() => WeatherElement, {
    foreignKey: 'element_slug',
  })
  declare element: BelongsTo<typeof WeatherElement>

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

  @hasMany(() => SummaryRecord, {
    foreignKey: 'sensor_id',
  })
  declare summary_records: HasMany<typeof SummaryRecord>

  @hasMany(() => SensorTag, {
    foreignKey: 'sensor_id',
  })
  declare tags: HasMany<typeof SensorTag>

  async get_type_information(): Promise<{
    max_summary: boolean
    min_summary: boolean
    avg_summary: boolean
    sum_summary: boolean
    latest_summary: boolean
    oldest_summary: boolean
    custom_summary: boolean
  }> {
    if (this.$preloaded.element === undefined) {
      const sensor: Sensor = this
      await sensor.load('element')
    }
    return {
      max_summary: this.element.summary_type.includes('max'),
      min_summary: this.element.summary_type.includes('min'),
      avg_summary: this.element.summary_type.includes('avg'),
      sum_summary: this.element.summary_type === 'sum',
      latest_summary: this.element.summary_type === 'latest',
      oldest_summary: this.element.summary_type === 'oldest',
      custom_summary: this.element.summary_type === 'custom',
    }
  }
}
