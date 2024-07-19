import { DateTime } from 'luxon'
import { belongsTo, column, hasMany } from '@adonisjs/lucid/orm'
import type { SummaryType } from 'owvision-environment/types'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import SummaryRecord from './summary_record.js'
import WeatherStation from './weather_station.js'
import { TimeUnit } from 'owvision-environment/scheduler'
import AppBaseModel from './app_base_model.js'

export default class Summary extends AppBaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column.dateTime({
    autoCreate: true,
  })
  declare created_at: DateTime

  @column()
  declare type: SummaryType

  @column()
  declare weather_station_id: number

  @belongsTo(() => WeatherStation, {
    foreignKey: 'weather_station_id',
  })
  declare weather_station: BelongsTo<typeof WeatherStation>

  @hasMany(() => SummaryRecord, {
    foreignKey: 'summary_id',
  })
  declare records: HasMany<typeof SummaryRecord>

  static current(type: TimeUnit & SummaryType, time: DateTime = DateTime.now()) {
    return Summary.query()
      .where('created_at', '>=', time.startOf(type).toString())
      .andWhere('created_at', '<', time.endOf(type).toString())
      .andWhere('type', type)
  }

  static latest(type: SummaryType, weather_station_id: number) {
    return Summary.query()
      .where('type', type)
      .andWhere('weather_station_id', weather_station_id)
      .orderBy('created_at', 'desc')
      .first()
  }
}
