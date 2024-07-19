import vine from "@vinejs/vine"
import { SensorSummaryType, SensorSummaryTypes, SummaryTypes } from "../types/summary_types.js"

export type InterfaceMetaInformation = {
    name: string,
    description: string,
    author?: string,
    sensors: SensorInformation[],
}

export type SensorInformation = {
    slug: string,
    name: string,
    summary_type: SensorSummaryType,
    description?: string,
    record_interval: string | {
        configurable?: boolean,
        default: string,
        choices?: string[],
        range?: [string | null, string | null]
    }
}
  
const interval = vine.string();

const interface_meta_information_validator = vine.compile(vine.object({
    name: vine.string().maxLength(100).minLength(1),
    description: vine.string().maxLength(200),
    author: vine.string().optional(),
    sensors: vine.array(vine.object({
        slug: vine.string(),
        name: vine.string(),
        description: vine.string().optional(),
        summary_type: vine.enum(SensorSummaryTypes),
        record_interval: vine.union([
            vine.union.if((record_interval) => vine.helpers.isString(record_interval), interval.clone()),
            vine.union.else(vine.object({
                default: interval.clone(),
                configurable: vine.boolean().optional(),
                choices: vine.array(interval.clone()).optional(),
                range: vine.tuple([interval.clone().nullable(), interval.clone().nullable()])
            }))
        ])
}))}));

export async function validate_interface_meta_information(payload: any){
    return interface_meta_information_validator.validate(payload);
}
