import type { HttpContext } from '@adonisjs/core/http'
import app from '@adonisjs/core/services/app'
import { unlink } from 'fs/promises'
import { install_interface_validator, interface_slug_validator } from '#validators/weather_stations';
import StationInterface from '#models/station_interface';
import InterfaceNotFoundException from '#exceptions/interface_not_found_exception';

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

        await payload.interface.move(app.makePath("interfaces"), {
            name: payload.slug + ".js",
            overwrite: true,
        });

        const new_station_interface = await StationInterface.create({
            slug: payload.slug,
        });
        const description = (await new_station_interface.ClassConstructor).description;
        if(description){
            new_station_interface.description = description;
            await new_station_interface.save();
        }

        return {
            success: true,
        }
    }
}