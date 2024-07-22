import { DateTime } from 'luxon'
import { belongsTo, column } from '@adonisjs/lucid/orm'
import Sensor from './sensor.js'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import { TimeUnit } from 'owvision-environment/scheduler'
import AppBaseModel from './app_base_model.js'
import { Unit, convert } from 'owvision-environment/units'
import { Exception } from '@adonisjs/core/exceptions'
import type { MetaInformation } from 'owvision-environment/types'

export default class Record extends AppBaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare sensor_id: number

  @column()
  declare value: number | null

  @column()
  declare meta_information: MetaInformation

  @column()
  declare unit: Unit | 'none'

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
      meta_information?: MetaInformation
      unit: Unit | 'none'
      created_at: DateTime
    },
    target_unit: Unit | 'none'
  ) {
    if (target_unit === 'none' && raw_record.unit !== 'none')
      throw new Exception(`Invalid unit '${raw_record.unit}': Expected 'none'!`, { status: 400 })
    if (target_unit !== 'none' && raw_record.unit !== 'none' && target_unit !== raw_record.unit) {
      raw_record.value = convert(raw_record.value, raw_record.unit, target_unit)
      raw_record.unit = target_unit
    }
    return await this.create(raw_record)
  }

  convert_to(unit: Unit) {
    if (this.unit === 'none') {
      throw new Exception('Cannot change unit of an record not having any unit!', { status: 400 })
    }

    this.value = convert(this.value, this.unit, unit)
    this.unit = unit
  }
}
