import { column, computed, hasMany, hasOne } from '@adonisjs/lucid/orm'
import type { HasMany, HasOne } from '@adonisjs/lucid/types/relations'
import UnitConfig from './unit_config.js'
import Sensor from './sensor.js'
import Summary from './summary.js'
import { WeatherStationInterface } from '../other/weather_station_interface.js'
import AppBaseModel from './app_base_model.js'

export type WeatherStationState = 'connecting' | 'connected' | 'disconnected' | 'disconnecting'

export const WeatherStationStates = ['connecting', 'connected', 'disconnected', 'disconnecting']

export default class WeatherStation extends AppBaseModel {
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
  declare state: WeatherStationState

  @computed({
    serializeAs: null,
  })
  get interface_class(): Promise<typeof WeatherStationInterface> {
    return import(`../../interfaces/${this.interface}.js`).then((value) => {
      return value?.default
    })
  }
}
