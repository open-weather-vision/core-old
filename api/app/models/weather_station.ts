import { BaseModel, column, hasMany, hasOne } from '@adonisjs/lucid/orm'
import type { HasMany, HasOne } from '@adonisjs/lucid/types/relations'
import UnitConfig from './unit_config.js'
import Sensor from './sensor.js'
import { ModelObject } from '@adonisjs/lucid/types/model'
import Summary from './summary.js'

export type WeatherStationState = 'connecting' | 'connected' | 'disconnected' | 'disconnecting'

export const WeatherStationStates = ['connecting', 'connected', 'disconnected', 'disconnecting']

export default class WeatherStation extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare slug: string

  @column()
  declare running: boolean

  @column()
  declare name: string

  @column()
  declare interface: string

  @column()
  declare interface_config: object

  @column({ serializeAs: null })
  declare unit_config_id: number

  @hasOne(() => UnitConfig, {
    foreignKey: 'weather_station_id',
  })
  declare unit_config: HasOne<typeof UnitConfig>

  @hasMany(() => Sensor, {
    foreignKey: 'weather_station_id',
  })
  declare sensors: HasMany<typeof Sensor>

  @hasMany(() => Summary, {
    foreignKey: 'weather_station_id',
  })
  declare summaries: HasMany<typeof Summary>

  @column()
  declare state: WeatherStationState
}
