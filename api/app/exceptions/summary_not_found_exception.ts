import { Exception } from '@adonisjs/core/exceptions'

export default class SummaryNotFoundException extends Exception {
  static status = 404
  static code = 'E_SUMMARY_NOT_FOUND'

  constructor(){
   super(`There is not summary for the passed interval!`)
 }
}