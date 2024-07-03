import { Exception } from '@adonisjs/core/exceptions'

export default class StationNotFoundException extends Exception {
  static status = 404
  static code = 'E_STATION_NOT_FOUND'

  constructor(station?: string | null){
   super(station === null || station === undefined ? `You didn't pass any station!` : `Unknown station '${station}!'`)
 }
}