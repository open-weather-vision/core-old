import app from '@adonisjs/core/services/app';
import { BaseModel, column, computed, hasMany } from '@adonisjs/lucid/orm'
import { WeatherStationInterface } from 'owvision-environment/interfaces';
import WeatherStation from './weather_station.js';
import type { HasMany } from '@adonisjs/lucid/types/relations';

export default class StationInterface extends BaseModel {
  @column({ isPrimary: true })
  declare slug: string

  @column()
  declare description: string;

  @computed({
    serializeAs: null,
  })
  get ClassConstructor(): Promise<typeof WeatherStationInterface> {
    return WeatherStationInterface.constructor_from_interface_file(app.makePath(`interfaces/${this.slug}.js`));
  }

  @hasMany(() => WeatherStation, {
    foreignKey: "interface",
  })
  declare stations: HasMany<typeof WeatherStation>

}