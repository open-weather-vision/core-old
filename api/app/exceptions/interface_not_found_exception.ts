import { Exception } from '@adonisjs/core/exceptions'

export default class InterfaceNotFoundException extends Exception {
   static status = 404
   static code = 'E_INTERFACE_NOT_FOUND'

   constructor(station_interface: string){
    super(`Unknown interface '${station_interface}!'`)
  }
}