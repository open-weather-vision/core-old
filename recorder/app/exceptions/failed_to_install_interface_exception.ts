import { Exception } from '@adonisjs/core/exceptions'

export default class FailedToInstallInterfaceException extends Exception {
   static status = 400
   static code = 'E_INTERFACE_INSTALL_FAILED'

   constructor(slug: string, message: string){
    super(`Failed to install interface (${slug}): ${message}`);
  }
}