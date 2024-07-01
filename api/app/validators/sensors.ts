import vine from '@vinejs/vine'
import { Units } from '../other/units/units.js'
import { DateTime } from 'luxon'

export const write_validator = vine.compile(
  vine.object({
    value: vine.number().nullable(),
    created_at: vine.string().transform((value) => {
      const result = DateTime.fromISO(value)

      if (!result.isValid) throw new Error("'created_at' is no valid datetime.")

      return result
    }),
    unit: vine.enum(['none', ...Units]),
  })
)

export const read_query_params_validator = vine.compile(
  vine.object({
    unit: vine.enum(Units).optional(),
  })
)
