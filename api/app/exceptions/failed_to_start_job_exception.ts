import { Exception } from '@adonisjs/core/exceptions'

export default class FailedToStartJobException extends Exception {
   static status = 404
   static code = 'E_FAILED_TO_START_JOB'

   constructor(){
    super(`Failed to start local recorder job!`)
  }
}