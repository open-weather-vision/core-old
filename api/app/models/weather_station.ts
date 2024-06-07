import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'

export default class WeatherStation extends BaseModel {
  @column({ isPrimary: true })
  declare name: string
}
