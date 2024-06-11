import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column, computed } from '@adonisjs/lucid/orm'
import Sensor from './sensor.js'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'

export default class Record extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare sensor_id: number

  @column()
  declare value_int: number | null

  @column()
  declare value_float: number | null

  @column.dateTime({ autoCreate: true })
  declare created_at: DateTime

  @computed()
  get value() {
    return this.value_int !== null ? this.value_int : this.value_float
  }

  @belongsTo(() => Sensor, {
    foreignKey: 'sensor_id',
  })
  declare sensor: BelongsTo<typeof Sensor>

  static hour() {
    return Record.query().where(
      'created_at',
      '>',
      DateTime.now().set({ minute: 0, second: 0, millisecond: 0 }).toISO()
    )
  }

  static day() {
    return Record.query().where(
      'created_at',
      '>',
      DateTime.now().set({ hour: 0, minute: 0, second: 0, millisecond: 0 }).toISO()
    )
  }

  static week() {
    return Record.query().where(
      'created_at',
      '>',
      DateTime.now().set({ localWeekday: 1, hour: 0, minute: 0, second: 0, millisecond: 0 }).toISO()
    )
  }

  static month() {
    return Record.query().where(
      'created_at',
      '>',
      DateTime.now().set({ day: 1, hour: 0, minute: 0, second: 0, millisecond: 0 }).toISO()
    )
  }

  static year() {
    return Record.query().where(
      'created_at',
      '>',
      DateTime.now().set({ month: 1, hour: 0, minute: 0, second: 0, millisecond: 0 }).toISO()
    )
  }

  static alltime() {
    return Record.query().where(
      'created_at',
      '>',
      DateTime.now().set({ month: 1, hour: 0, minute: 0, second: 0, millisecond: 0 }).toISO()
    )
  }
}
