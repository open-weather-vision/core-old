import { Exception } from '@adonisjs/core/exceptions'

export default class LoginException extends Exception {
  static status = 401
  static code = "E_LOGIN"
  
  constructor(){
    super(`Failed to login. Invalid username and password combination!`)
  }

}