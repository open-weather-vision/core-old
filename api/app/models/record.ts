import { DateTime } from 'luxon'
import { belongsTo, column } from '@adonisjs/lucid/orm'
import Sensor from './sensor.js'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import { TimeUnit } from '../other/scheduler.js'
import AppBaseModel from './app_base_model.js'
import { Unit, convert } from '../other/units/units.js'
import { Exception } from '@adonisjs/core/exceptions'

export default class Record extends AppBaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare sensor_id: number

  @column()
  declare value: number | null

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

  convert_to(unit: Unit) {
    if (this.unit === 'none') {
      throw new Exception('Cannot change unit of an record not having any unit!')
    }

    this.value = convert(this.value, this.unit, unit)
    this.unit = unit
  }
}
