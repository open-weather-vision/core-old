import vine from '@vinejs/vine'
import { SummaryTypes } from '../other/summaries/summary_types.js'
import { Units } from '../other/units/units.js'

export const get_latest_route_params_validator = vine.compile(
  vine.object({
    slug: vine.string(),
    sensor_slug: vine.string(),
  })
)

export const get_latest_query_params_validator = vine.compile(
  vine.object({
    type: vine.enum(SummaryTypes),
    unit: vine.enum(Units).optional(),
  })
)

export const get_one_route_params_validator = vine.compile(
  vine.object({
    slug: vine.string(),
    sensor_slug: vine.string(),
  })
)

export const get_one_query_params_validator = vine.compile(
  vine.object({
    year: vine.number().withoutDecimals().min(0),
    month: vine.number().withoutDecimals().min(1).max(12).optional(),
    day: vine.number().withoutDecimals().min(1).max(31).optional(),
    week: vine.number().withoutDecimals().min(1).optional(),
    hour: vine.number().withoutDecimals().min(0).max(23).optional(),
    unit: vine.enum(Units).optional(),
  })
)
