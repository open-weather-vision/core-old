import { Exception } from '@adonisjs/core/exceptions'

export default class FailedToInstallInterfaceException extends Exception {
   static status = 400
   static code = 'E_INTERFACE_INSTALL_FAILED'

   constructor(repository_url: string, message: string){
    super(`Failed to install interface (${repository_url}): ${message}`);
  }
}