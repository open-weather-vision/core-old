import { Exception } from '@adonisjs/core/exceptions'

export default class FailedToStartJobException extends Exception {
   static status = 404
   static code = 'E_FAILED_TO_START_JOB'

   constructor(station_slug: string, reason: string){
    super(`Failed to start the registered recorder job for station '${station_slug}'! Reason: ${reason}`)
  }
}