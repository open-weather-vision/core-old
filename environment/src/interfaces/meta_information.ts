import vine from "@vinejs/vine";
import { Argument, argument_vine_object } from "./weather_station_interface.js";
import { readFile } from "fs/promises";
import { join } from "path";

export async function validate_meta_file() {
    const meta = await readFile(
        join(import.meta.dirname, "../../../../meta.owvision.json")
    );
    const json = JSON.parse(meta.toString("utf-8"));

    try {
        await validate_interface_meta_information(json);
        console.log("Meta file is fine!");
    } catch (err: any) {
        console.error(`Validation error: ${err.messages[0].message}`);
    }
}

export type InterfaceMetaInformation = {
    slug: string;
    name: string;
    description: string;
    entrypoint: string;
    author?: string;
    sensors: SensorInformation[];
    config_arguments?: { [Property in string]: Argument<any> };
};

export type SensorInformation = {
    slug: string;
    name: string;
    element: string;
    description: string;
    record_interval:
        | string
        | {
              configurable?: boolean;
              default: string;
              choices?: string[];
              min?: string;
              max?: string;
          };
};

const interval = vine.string();

const interface_meta_information_validator = vine.compile(
    vine.object({
        slug: vine
            .string()
            .trim()
            .alphaNumeric({
                allowDashes: true,
                allowSpaces: false,
                allowUnderscores: true,
            })
            .maxLength(50),
        entrypoint: vine.string().trim(),
        name: vine.string().maxLength(100).minLength(1),
        description: vine.string().maxLength(200),
        author: vine.string().optional(),
        config_arguments: vine.record(argument_vine_object).optional(),
        sensors: vine.array(
            vine.object({
                slug: vine.string(),
                name: vine.string(),
                description: vine.string(),
                element: vine.string(),
                record_interval: vine.union([
                    vine.union.if(
                        (record_interval) =>
                            vine.helpers.isString(record_interval),
                        interval.clone()
                    ),
                    vine.union.else(
                        vine.object({
                            default: interval.clone(),
                            configurable: vine.boolean().optional(),
                            choices: vine.array(interval.clone()).optional(),
                            min: interval.clone().optional(),
                            max: interval.clone().optional(),
                        })
                    ),
                ]),
            })
        ),
    })
);

export async function validate_interface_meta_information(payload: any) {
    return interface_meta_information_validator.validate(payload);
}
