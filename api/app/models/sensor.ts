import { BaseModel, belongsTo, column, hasMany } from '@adonisjs/lucid/orm'
import type { SensorSummaryType } from '../utils/summaries/summary_types.js'
import type { UnitType } from '../utils/units/units.js'
import WeatherStation from './weather_station.js'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import Record from './record.js'

export default class Sensor extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare name: string

  @column()
  declare summary_type: SensorSummaryType

  @column()
  declare record_interval_seconds: number

  @column()
  declare unit_type: UnitType

  @column()
  declare value_type: 'int' | 'double'

  @column()
  declare weather_station_id: number

  @belongsTo(() => WeatherStation, {
    foreignKey: 'weather_station_id',
  })
  declare weather_station: BelongsTo<typeof WeatherStation>

  @hasMany(() => Record, {
    foreignKey: 'sensor_id',
  })
  declare records: HasMany<typeof Record>
}
