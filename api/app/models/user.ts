import { column, computed, hasMany } from '@adonisjs/lucid/orm'
import Session from './session.js';
import type { HasMany } from '@adonisjs/lucid/types/relations';
import type { Role } from 'owvision-environment/types';
import { Roles } from 'owvision-environment/types';
import AppBaseModel from './app_base_model.js';

export default class User extends AppBaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare name: string

  @column()
  declare password: string

  @column()
  declare role: Role

  @hasMany(() => Session, {
    foreignKey: "user_id",
  })
  declare sessions: HasMany<typeof Session>

  @computed()
  get role_index(){
    return Roles.indexOf(this.role);
  }
}