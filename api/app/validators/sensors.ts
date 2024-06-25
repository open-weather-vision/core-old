import vine from '@vinejs/vine'
import { Units } from '../other/units/units.js'

export const write_validator = vine.compile(
  vine.object({
    value: vine.number().nullable(),
    created_at: vine.date().optional(),
    unit: vine.enum(['none', ...Units]),
  })
)

export const read_query_params_validator = vine.compile(
  vine.object({
    unit: vine.enum(Units).optional(),
  })
)
