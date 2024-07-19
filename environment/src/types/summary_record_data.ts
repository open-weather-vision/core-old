import { DateTime } from "luxon"
import { MetaInformation } from "./meta_information.js"

export type SummaryRecordData = {
    min_time?: DateTime | null
    min_value?: number | null
    min_meta_information?: MetaInformation
  
    max_time?: DateTime | null
    max_value?: number | null
    max_meta_information?: MetaInformation
  
    value?: number | null
    time?: DateTime | null
    meta_information?: MetaInformation
  
    avg_value?: number | null
  
    record_count: number
    valid_record_count: number
    latest_update: DateTime | null
    latest_valid_update: DateTime | null
  }