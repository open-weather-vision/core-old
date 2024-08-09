import { belongsTo, column, hasMany, hasOne } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany, HasOne } from '@adonisjs/lucid/types/relations'
import Sensor from './sensor.js'
import Summary from './summary.js'
import AppBaseModel from './app_base_model.js'
import StationInterface from './station_interface.js'
import type { InterfaceConfig } from 'owvision-environment/interfaces'
import type { ConnectionState, ActivityState, RecorderType } from 'owvision-environment/types'

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
  declare config_arguments: InterfaceConfig

  @column()
  declare recorder_type: RecorderType

  @column({ serializeAs: null })
  declare unit_config_id: number

  @hasMany(() => Sensor, {
    foreignKey: 'weather_station_id',
  })
  declare sensors: HasMany<typeof Sensor>

  @hasMany(() => Summary, {
    foreignKey: 'weather_station_id',
  })
  declare summaries: HasMany<typeof Summary>

  @column()
  declare activity_state: ActivityState

  @column()
  declare connection_state: ConnectionState
}
