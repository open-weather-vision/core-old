import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import Summary from './summary.js'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import AppBaseModel from './app_base_model.js'
import { Unit, convert } from '../other/units/units.js'
import { Exception } from '@adonisjs/core/exceptions'
import Sensor from './sensor.js'

export type SummaryRecordData = {
  min_time?: DateTime | null
  min_value?: number | null
  max_time?: DateTime | null
  max_value?: number | null
  avg_value?: number | null
  time?: DateTime | null
  value?: number | null
  record_count: number
  valid_record_count: number
  latest_update: DateTime | null
  latest_valid_update: DateTime | null
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

  @belongsTo(() => Sensor, {
    foreignKey: 'sensor_id',
  })
  declare sensor: BelongsTo<typeof Sensor>

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

  static createForSensor(sensor: Sensor, summary_id: number, unit: Unit | 'none') {
    const type_information = sensor.get_type_information()

    const data: SummaryRecordData = {
      record_count: 0,
      valid_record_count: 0,
      latest_update: null,
      latest_valid_update: null,
    }

    if (type_information.avg_summary) {
      data.avg_value = null
    }

    if (type_information.max_summary) {
      data.max_value = null
      data.max_time = null
    }

    if (type_information.min_summary) {
      data.min_value = null
      data.min_time = null
    }

    if (
      type_information.sum_summary ||
      type_information.oldest_summary ||
      type_information.latest_summary ||
      type_information.custom_summary
    ) {
      data.value = null
      data.time = null
    }

    return this.create({
      sensor_id: sensor.id,
      summary_id,
      unit,
      data,
    })
  }
}
