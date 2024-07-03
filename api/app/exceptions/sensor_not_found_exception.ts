import { Exception } from '@adonisjs/core/exceptions'

export default class SensorNotFoundException extends Exception {
   static status = 404
   static code = 'E_SENSOR_NOT_FOUND'

   constructor(sensor: string){
    super(`Unknown sensor '${sensor}!'`)
  }
}