import { column, hasMany } from '@adonisjs/lucid/orm'
import WeatherStation from './weather_station.js'
import type { HasMany } from '@adonisjs/lucid/types/relations'
import type {
  Argument,
  InterfaceMetaInformation,
  SensorInformation,
} from 'owvision-environment/interfaces'
import AppBaseModel from './app_base_model.js'

export default class StationInterface extends AppBaseModel implements InterfaceMetaInformation {
  @column()
  declare repository_url: string

  @column({ isPrimary: true })
  declare slug: string

  @column()
  declare description: string

  @column()
  declare author: string

  @column()
  declare name: string

  @column()
  declare entrypoint: string

  @column()
  declare config_arguments: { [Property in string]: Argument<any> }

  @column()
  declare commands: any // TODO: Define commands type

  @column()
  declare sensors: SensorInformation[]

  @hasMany(() => WeatherStation, {
    foreignKey: 'interface_slug',
  })
  declare stations: HasMany<typeof WeatherStation>
}
