import { belongsTo, column } from '@adonisjs/lucid/orm'
import Summary from './summary.js'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import AppBaseModel from './app_base_model.js'
import { Exception } from '@adonisjs/core/exceptions'
import Sensor from './sensor.js'
import type { SummaryRecordData } from 'owvision-environment/types'
import units from 'simple-units'

export default class SummaryRecord extends AppBaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare sensor_id: number

  @column()
  declare summary_id: number

  @column()
  declare unit: string | null

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

  convert_to(unit: string) {
    if (this.unit === null) {
      throw new Exception('Cannot change unit of an record not having any unit!')
    }
    if (this.data.value !== null && this.data.value !== undefined)
      this.data.value = units.from(this.data.value, this.unit).to(unit)
    if (this.data.avg_value !== null && this.data.avg_value !== undefined)
      this.data.avg_value = units.from(this.data.avg_value, this.unit).to(unit)
    if (this.data.max_value !== null && this.data.max_value !== undefined)
      this.data.max_value = units.from(this.data.max_value, this.unit).to(unit)
    if (this.data.min_value !== null && this.data.min_value !== undefined)
      this.data.min_value = units.from(this.data.min_value, this.unit).to(unit)
    this.unit = unit
  }

  static async createForSensor(sensor: Sensor, summary_id: number, unit: string | null) {
    const type_information = await sensor.get_type_information()

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
