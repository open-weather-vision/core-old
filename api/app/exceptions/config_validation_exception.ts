import { Exception } from '@adonisjs/core/exceptions'

export default class ConfigValidationException extends Exception {
   static status = 400
   static code = 'E_CONFIG_VALIDATION'

   constructor(message: string){
    ;
    super(`Invalid interface configuration passed: ${message}`);
  }
}