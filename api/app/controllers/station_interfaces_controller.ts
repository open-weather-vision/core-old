import type { HttpContext } from '@adonisjs/core/http'
import app from '@adonisjs/core/services/app'
import { readFile, unlink } from 'fs/promises'
import { install_interface_validator, interface_slug_validator } from '#validators/weather_stations';
import StationInterface from '#models/station_interface';
import InterfaceNotFoundException from '#exceptions/interface_not_found_exception';
import exec from "await-exec";
import FailedToInstallInterfaceException from '#exceptions/failed_to_install_interface_exception';

export default class StationInterfacesController {
    async get_all_interfaces() {
        const interfaces = await StationInterface.query().exec();

        return {
            success: true,
            data: interfaces
        }
    }

    async uninstall_interface(ctx: HttpContext) {
        const slug = await interface_slug_validator.validate(ctx.params.slug);

        const station_interface = await StationInterface.query().where('slug', slug).first();
        if(!station_interface){
            throw new InterfaceNotFoundException(slug);
        }

        await station_interface.delete();
        await unlink(app.makePath(`interfaces/${slug}.js`));

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

        // Clone repository
        const result = await exec(`./install_interface.sh ${payload.repository_url}`);

        if(result.stdErr?.length > 0){
            throw new FailedToInstallInterfaceException(payload.repository_url, result.stdErr);
        }

        // Read meta data
        const meta_file_path = app.makePath(`../${result.stdOut}/meta.json`);

        const meta_information = JSON.parse(((await readFile(meta_file_path)).toString("utf-8")));

        new_station_interface.description = meta_information.description;
        new_station_interface.name = meta_information.name;

        return {
            success: true,
        }
    }
}