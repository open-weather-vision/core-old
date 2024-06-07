import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import Summary from './summary.js'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'

export default class SummaryRecord extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare sensor_id: number

  @column()
  declare summary_id: number

  @column()
  declare value_int: number

  @column()
  declare value_float: number

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @belongsTo(() => Summary, {
    foreignKey: 'summary_id',
  })
  declare summary: BelongsTo<typeof Summary>
}
