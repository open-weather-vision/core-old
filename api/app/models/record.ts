import { DateTime } from 'luxon'
import { belongsTo, column } from '@adonisjs/lucid/orm'
import Sensor from './sensor.js'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import { TimeUnit } from 'owvision-environment/scheduler'
import AppBaseModel from './app_base_model.js'
import { Exception } from '@adonisjs/core/exceptions'
import units from 'simple-units'

export default class Record extends AppBaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare sensor_id: number

  @column()
  declare value: number | null

  @column()
  declare unit: string | null

  @column.dateTime({ autoCreate: true })
  declare created_at: DateTime

  @belongsTo(() => Sensor, {
    foreignKey: 'sensor_id',
  })
  declare sensor: BelongsTo<typeof Sensor>

  static current(interval: TimeUnit, time: DateTime = DateTime.now()) {
    return Record.query()
      .where('created_at', '>=', time.startOf(interval).toString())
      .andWhere('created_at', '<', time.endOf(interval).toString())
  }

  static async create_with_target_unit(
    raw_record: {
      sensor_id: number
      value: number | null
      unit: string | null
      created_at: DateTime
    },
    target_unit: string | null
  ) {
    if (target_unit === null && raw_record.unit !== null)
      throw new Exception(`Invalid unit '${raw_record.unit}': Expected null!`, { status: 400 })
    if (
      raw_record.value !== null &&
      target_unit !== null &&
      raw_record.unit !== null &&
      target_unit !== raw_record.unit
    ) {
      raw_record.value = units.from(raw_record.value, raw_record.unit).to(target_unit)
      raw_record.unit = target_unit
    }
    return await this.create(raw_record)
  }

  convert_to(unit: string) {
    if (this.unit === null) {
      throw new Exception('Cannot change unit of an record not having any unit!', { status: 400 })
    }
    if (this.value !== null) {
      this.value = units.from(this.value, this.unit).to(unit)
    }
    this.unit = unit
  }
}
