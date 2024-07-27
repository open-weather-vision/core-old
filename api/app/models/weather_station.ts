import { belongsTo, column, hasMany, hasOne } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany, HasOne } from '@adonisjs/lucid/types/relations'
import UnitConfig from './unit_config.js'
import Sensor from './sensor.js'
import Summary from './summary.js'
import AppBaseModel from './app_base_model.js'
import StationInterface from './station_interface.js'
import type { InterfaceConfig } from 'owvision-environment/interfaces'
import type { WeatherStationState, TargetWeatherStationState } from 'owvision-environment/types'

export default class WeatherStation extends AppBaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare slug: string

  @column()
  declare name: string

  @column()
  declare interface_slug: string

  @belongsTo(() => StationInterface, {
    foreignKey: 'interface_slug',
  })
  declare interface: BelongsTo<typeof StationInterface>

  @column()
  declare interface_config: InterfaceConfig

  @column()
  declare remote_recorder: boolean

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
  declare target_state: TargetWeatherStationState

  @column()
  declare connection_state: WeatherStationState
}
