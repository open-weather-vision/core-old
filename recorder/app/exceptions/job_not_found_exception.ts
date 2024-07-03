import { Exception } from '@adonisjs/core/exceptions'

export default class JobNotFoundException extends Exception {
   static status = 404
   static code = 'E_JOB_NOT_FOUND'

   constructor(station_slug: string){
    super(`Unknown job for station '${station_slug}!'`)
  }
}