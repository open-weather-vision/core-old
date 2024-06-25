import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import Summary from './summary.js'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import AppBaseModel from './app_base_model.js'
import { Unit, convert } from '../other/units/units.js'
import { Exception } from '@adonisjs/core/exceptions'

export type SummaryRecordData = {
  min_time?: DateTime | null
  min_value?: number | null
  max_time?: DateTime | null
  max_value?: number | null
  avg_value?: number | null
  time?: DateTime | null
  value?: number | null
}

export default class SummaryRecord extends AppBaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare sensor_id: number

  @column()
  declare summary_id: number

  @column()
  declare unit: Unit | 'none'

  @column()
  declare data: SummaryRecordData

  @belongsTo(() => Summary, {
    foreignKey: 'summary_id',
  })
  declare summary: BelongsTo<typeof Summary>

  convert_to(unit: Unit) {
    if (this.unit === 'none') {
      throw new Exception('Cannot change unit of an record not having any unit!')
    }
    this.data.value = convert(this.data.value, this.unit, unit)
    this.data.avg_value = convert(this.data.avg_value, this.unit, unit)
    this.data.max_value = convert(this.data.max_value, this.unit, unit)
    this.data.min_value = convert(this.data.min_value, this.unit, unit)
    this.unit = unit
  }
}
