import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import Summary from './summary.js'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'

export type SummaryRecordData = {
  min_time?: DateTime | null
  min_value?: number | null
  max_time?: DateTime | null
  max_value?: number | null
  avg_value?: number | null
  time?: DateTime | null
  value?: number | null
}

export default class SummaryRecord extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare sensor_id: number

  @column()
  declare summary_id: number

  @column()
  declare data: SummaryRecordData

  @belongsTo(() => Summary, {
    foreignKey: 'summary_id',
  })
  declare summary: BelongsTo<typeof Summary>
}
