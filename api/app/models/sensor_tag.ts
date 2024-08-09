import { belongsTo, column } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Sensor from './sensor.js'
import AppBaseModel from './app_base_model.js'
import { SensorTag as Tag } from 'owvision-environment/types'

export default class SensorTag extends AppBaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare sensor_id: number

  @column()
  declare tag: Tag

  @belongsTo(() => Sensor, {
    foreignKey: 'sensor_id',
  })
  declare sensor: BelongsTo<typeof Sensor>
}
