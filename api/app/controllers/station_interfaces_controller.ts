import type { HttpContext } from '@adonisjs/core/http'
import app from '@adonisjs/core/services/app'
import { readFile, rm } from 'fs/promises'
import { install_interface_validator, interface_slug_validator } from '#validators/weather_stations';
import StationInterface from '#models/station_interface';
import InterfaceNotFoundException from '#exceptions/interface_not_found_exception';
import util from "node:util";
import { exec } from "node:child_process";
const awaitExec = util.promisify(exec);
import FailedToInstallInterfaceException from '#exceptions/failed_to_install_interface_exception';
import { validate_interface_meta_information } from 'owvision-environment/interfaces';
import logger from '@adonisjs/core/services/logger';
import { zip } from 'zip-a-folder';
import WeatherStation from '#models/weather_station';
import InterfaceInUseException from '#exceptions/interface_in_use_exception';
import { createReadStream } from 'fs';

export default class StationInterfacesController {
    async get_all_interfaces() {
        const interfaces = await StationInterface.query().exec();

        return {
            success: true,
            data: interfaces
        }
    }

    async get_interface_zip(ctx: HttpContext){
        const payload = await interface_slug_validator.validate(ctx.request.params());
        const station_interface = await StationInterface.query().where('slug', payload.slug).first();
        if(!station_interface){
            throw new InterfaceNotFoundException(payload.slug);
        }

        const zip = createReadStream(`/interfaces/${station_interface.dirname}.zip`)
        ctx.response.stream(zip);
    }

    async uninstall_interface(ctx: HttpContext) {
        const payload = await interface_slug_validator.validate(ctx.request.params());
        const station_interface = await StationInterface.query().where('slug', payload.slug).first();
        if(!station_interface){
            throw new InterfaceNotFoundException(payload.slug);
        }

        // Check if any weather station uses the interface
        const stations_using_interface = (await WeatherStation.query()
            .where('interface_slug', station_interface.slug)
            .select('slug')
            .exec()).map(station => station.slug);

        if(stations_using_interface.length > 0){
            throw new InterfaceInUseException(station_interface.slug, stations_using_interface);
        }

        // Delete folder and zip
        await rm(app.makePath(`../interfaces/${station_interface.dirname}`), {
            recursive: true,
            force: true
        });
        await rm(app.makePath(`../interfaces/${station_interface.dirname}.zip`), {
            force: true
        });

        // Delete in database
        const slug = station_interface.slug;
        const repository_url = station_interface.repository_url;
        await station_interface.delete();

        logger.info(`Successfully uninstalled interface '${slug}' (${repository_url})!`)

        return {
            success: true,
        }
    }

    async install_interface(ctx: HttpContext) {
        const payload = await ctx.request.validateUsing(install_interface_validator);

        // Check if interface is already installed
        const installed_interface = await StationInterface.query().where("repository_url", payload.repository_url).first();
        if(installed_interface){
            throw new FailedToInstallInterfaceException(payload.repository_url, "Interface is already installed!");
        }

        // Clone repository and run 'npm run install'
        const result = await awaitExec(`./install_interface.sh ${payload.repository_url}`);

        if(result.stderr?.length > 0){
            throw new FailedToInstallInterfaceException(payload.repository_url, result.stderr);
        }

        // Read meta data
        const dirname = result.stdout;
        logger.info(`Cloned repository to folder '/interfaces/${dirname}'!`)
        const meta_file_path = `/interfaces/${dirname}/meta.owvision.json`
        const raw_meta_information = JSON.parse(((await readFile(meta_file_path)).toString("utf-8")));
        const meta_information = await validate_interface_meta_information(raw_meta_information);
        logger.info("Read meta information!");

        // Create database entry
        const new_station_interface = await StationInterface.create({
            slug: meta_information.slug,
            repository_url: payload.repository_url,
            meta_information,
            dirname
        });
        logger.info("Created database entry!");

        // Create zip
        await zip(`/interfaces/${dirname}`, `/interfaces/${dirname}.zip`)
        logger.info("Created zip!");

        logger.info(`Successfully installed interface '${new_station_interface.slug} (${payload.repository_url}) in folder '${new_station_interface.dirname}'!'`)

        return {
            success: true,
            data: new_station_interface,
        }
    }
}