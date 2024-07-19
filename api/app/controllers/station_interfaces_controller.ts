import type { HttpContext } from '@adonisjs/core/http'
import app from '@adonisjs/core/services/app'
import { readFile, rm } from 'fs/promises'
import { install_interface_validator, uninstall_interface_validator } from '#validators/weather_stations';
import StationInterface from '#models/station_interface';
import InterfaceNotFoundException from '#exceptions/interface_not_found_exception';
import exec from "await-exec";
import FailedToInstallInterfaceException from '#exceptions/failed_to_install_interface_exception';
import { validate_interface_meta_information } from 'owvision-environment/interfaces';
import logger from '@adonisjs/core/services/logger';

export default class StationInterfacesController {
    async get_all_interfaces() {
        const interfaces = await StationInterface.query().exec();

        return {
            success: true,
            data: interfaces
        }
    }

    async uninstall_interface(ctx: HttpContext) {
        const payload = await ctx.request.validateUsing(uninstall_interface_validator);
        const station_interface = await StationInterface.query().where('repository_url', payload.repository_url).first();
        if(!station_interface){
            throw new InterfaceNotFoundException(payload.repository_url);
        }
        const short_name = station_interface.short_name;

        await rm(app.makePath(`interfaces/${station_interface.short_name}`), {
            recursive: true,
            force: true
        });
        await station_interface.delete();

        logger.info(`Successfully uninstalled interface '${short_name} (${payload.repository_url})!'`)

        return {
            success: true,
        }
    }

    async install_interface(ctx: HttpContext) {
        const payload = await ctx.request.validateUsing(install_interface_validator);

        // Create database entry
        const new_station_interface = await StationInterface.create({
            repository_url: payload.repository_url,
        });

        // Clone repository and run npm start
        const result = await exec(`./install_interface.sh ${payload.repository_url}`);

        if(result.stdErr?.length > 0){
            throw new FailedToInstallInterfaceException(payload.repository_url, result.stdErr);
        }

        // Read meta data
        const dirname = result.stdOut;
        const meta_file_path = app.makePath(`../${result.stdOut}/meta.json`);
        const raw_meta_information = JSON.parse(((await readFile(meta_file_path)).toString("utf-8")));

        const meta_information = await validate_interface_meta_information(raw_meta_information);

        // Update meta data
        new_station_interface.meta_information = meta_information;
        new_station_interface.dirname = dirname;
        new_station_interface.slug = meta_information.slug;
        await new_station_interface.save();

        logger.info(`Successfully installed interface '${new_station_interface.slug} (${payload.repository_url})!'`)

        return {
            success: true,
        }
    }
}