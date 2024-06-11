import vine from '@vinejs/vine'

export const writeSensorValidator = vine.compile(
  vine.object({
    value: vine.number().nullable(),
    created_at: vine.date().optional(),
  })
)
