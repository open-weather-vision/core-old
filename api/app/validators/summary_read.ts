import vine from '@vinejs/vine'
import { SummaryTypes } from '../other/summaries/summary_types.js'

export const readSummaryValidator = vine.compile(
  vine.object({
    interval: vine.enum(SummaryTypes),
    slug: vine.string(),
    sensor_slug: vine.string(),
  })
)
