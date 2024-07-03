import { Exception } from '@adonisjs/core/exceptions'

export default class AuthException extends Exception {
  static status = 401
  static code = 'E_AUTH'

  constructor(role?: string){
    super(`Authentication failed. Are you logged in?${role ? ` Minimum role: ${role}` : ''}`)
  }
}
