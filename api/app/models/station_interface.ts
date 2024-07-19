import { BaseModel, column, computed, hasMany } from '@adonisjs/lucid/orm'
import WeatherStation from './weather_station.js';
import type { HasMany } from '@adonisjs/lucid/types/relations';

export default class StationInterface extends BaseModel {
  @column({ isPrimary: true })
  declare repository_url: string

  @column()
  declare name: string

  @column()
  declare description: string;

  @hasMany(() => WeatherStation, {
    foreignKey: "interface",
  })
  declare stations: HasMany<typeof WeatherStation>

}