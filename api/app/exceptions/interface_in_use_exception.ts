import { Exception } from '@adonisjs/core/exceptions'

export default class InterfaceInUseException extends Exception {
   static status = 400
   static code = 'E_INTERFACE_IN_USE'

   constructor(slug: string, weather_stations: string[]){
    ;
    super(`Failed to uninstall interface (${slug}). It's used by: ${weather_stations.toString().replace(',', ', ')}.`);
  }
}