import { BaseModel, column, computed, hasMany } from '@adonisjs/lucid/orm'
import Session from './session.js';
import type { HasMany } from '@adonisjs/lucid/types/relations';

export type Role = 'admin' | 'recorder' | 'viewer';
export const Roles : Role[] = ['viewer', 'recorder', 'admin'];

export default class User extends BaseModel {
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