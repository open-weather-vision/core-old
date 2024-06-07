import { DateTime } from 'luxon'
import { BaseModel, column, hasMany } from '@adonisjs/lucid/orm'
import type { SummaryType } from '../utils/summaries/summary_types.js'
import type { HasMany } from '@adonisjs/lucid/types/relations'
import SummaryRecord from './summary_record.js'

export default class Summary extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column()
  declare type: SummaryType

  @hasMany(() => SummaryRecord, {
    foreignKey: 'summary_id',
  })
  declare records: HasMany<typeof SummaryRecord>
}
