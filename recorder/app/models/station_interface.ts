import { BaseModel, column, hasMany } from '@adonisjs/lucid/orm'
import { validate_interface_meta_information, type InterfaceMetaInformation } from 'owvision-environment/interfaces';
import exec from "await-exec";
import FailedToInstallInterfaceException from '#exceptions/failed_to_install_interface_exception';
import app from '@adonisjs/core/services/app';
import { readFile } from 'fs/promises';
import axios from 'axios';
import { createWriteStream } from 'fs';
import { pipeline } from 'stream';
import decompress from 'decompress';
import awaitExec from 'await-exec';
import logger from '@adonisjs/core/services/logger';
import interface_service from '#services/interface_service';

export default class StationInterface extends BaseModel {
  @column({ isPrimary: true })
  declare slug: string

  @column()
  declare meta_information: InterfaceMetaInformation


  static async install_and_start_interface_from_api(api_url: string, auth_token: string, interface_slug: string){
    logger.info(`Installing interface '${interface_slug}' from api '${api_url}'...`)
    try{
      const response = await axios({
        method: 'get',
        url: `${api_url}/interfaces/${interface_slug}`,
        headers: {
          "OWVISION_AUTH_TOKEN": auth_token
        },
        responseType: "stream"
      });
  
      
      // Download zip
      const zip_path = app.makePath(`../interfaces/${interface_slug}.zip`);
      await pipeline(response.data, createWriteStream(zip_path));
      
      // Unzip
      const folder_path = app.makePath(`../interfaces/${interface_slug}`);
      await decompress(zip_path, folder_path);

      // Run install command
      const result = await awaitExec(`cd /interfaces/${interface_slug} && npm run install`);
      if(result.stdErr.length > 0){
        throw new Error("Install command exited with an error (" + result.stdErr + ")");
      }

      // Get meta information
      const meta_file_path = `${folder_path}/meta.owvision.json`
      const raw_meta_information = JSON.parse(((await readFile(meta_file_path)).toString("utf-8")));
      const meta_information = await validate_interface_meta_information(raw_meta_information);

      const installed_interface = await StationInterface.create({
        meta_information,
        slug: interface_slug,
      })

      // Start interface on service
      await interface_service.start_interface(installed_interface);
      logger.info(`Installed interface successfully!`);
      return true;
    }catch(err){
      logger.error(`Failed to install interface: ` + err.message);
      return false;
    }
  }
}