import { BaseModel, column, hasMany } from '@adonisjs/lucid/orm'
import WeatherStation from './weather_station.js';
import type { HasMany } from '@adonisjs/lucid/types/relations';
import { InterfaceMetaInformation } from 'owvision-environment/interfaces';

export default class StationInterface extends BaseModel {
  @column({ isPrimary: true })
  declare repository_url: string

  @column()
  declare short_name: string

  @column()
  declare meta_information: InterfaceMetaInformation

  @hasMany(() => WeatherStation, {
    foreignKey: "interface",
  })
  declare stations: HasMany<typeof WeatherStation>

}