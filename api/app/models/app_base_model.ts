import { BaseModel, SnakeCaseNamingStrategy } from '@adonisjs/lucid/orm'

export default class AppBaseModel extends BaseModel {
  public static namingStrategy = new SnakeCaseNamingStrategy()
}
