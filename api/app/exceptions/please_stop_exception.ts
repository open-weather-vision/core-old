import { Exception } from '@adonisjs/core/exceptions'

export default class PleaseStopException extends Exception {
   static status = 400
   static code = 'E_PLEASE_STOP'

   constructor(){
    super(`The weather station is inactive. Please stop sending records! They will get ignored.`)
  }
}