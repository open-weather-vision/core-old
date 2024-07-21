import { BaseModel, column, hasMany } from '@adonisjs/lucid/orm'
import { validate_interface_meta_information, type InterfaceMetaInformation } from 'owvision-environment/interfaces';
import { readFile, writeFile } from 'fs/promises';
import axios from 'axios';
import { exec } from "node:child_process";
import util from "node:util";
const awaitExec = util.promisify(exec);
import logger from '@adonisjs/core/services/logger';
import interface_service from '#services/interface_service';
import extract from 'extract-zip';

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
      const zip_path = `/interfaces/${interface_slug}.zip`;
      await writeFile(zip_path, response.data);
      logger.info("Downloaded interface zip!");
      
      // Unzip
      const folder_path = `/interfaces/${interface_slug}`;
      await extract(zip_path, { dir: folder_path });
      logger.info("Extracted interface zip!");

      // Run install command
      const result = await awaitExec(`cd /interfaces/${interface_slug} && npm run build`);
      if(result.stderr?.length > 0){
        throw new Error("Build command exited with an error (" + result.stderr + ")");
      }
      logger.info("Build interface!");

      // Get meta information
      const meta_file_path = `${folder_path}/meta.owvision.json`
      const raw_meta_information = JSON.parse(((await readFile(meta_file_path)).toString("utf-8")));
      const meta_information = await validate_interface_meta_information(raw_meta_information);
      logger.info("Read interface information!");

      const installed_interface = await StationInterface.create({
        meta_information,
        slug: interface_slug,
      })
      logger.info("Created database record!");

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