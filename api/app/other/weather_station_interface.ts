import { DateTime } from 'luxon'
import { TimeUnit } from './scheduler.js'
import { SensorSummaryType, SummaryType } from './summaries/summary_types.js'
import { Unit, UnitType } from './units/units.js'

export type SensorDescription = {
  name: string
  tags: string[]
  summary_type: SensorSummaryType
  interval: number
  interval_unit: TimeUnit
  unit_type: UnitType
}

export type SensorsDescription = { [Property in string]: SensorDescription }

export type StoredRecord = {
  value: number | null
  created_at: DateTime | null
}

export type RecordWithUnit = {
  value: number | null
  unit?: Unit | 'none'
}

export type CommandResult = {
  success: boolean
  message: string
  data?: any
}

export class WeatherStationInterface {
  sensors: SensorsDescription = {}
  config: any

  constructor(config: any) {
    this.config = config
  }

  connect(): Promise<boolean> {
    return Promise.resolve(false)
  }

  record(sensor_slug: string): Promise<RecordWithUnit> {
    return Promise.resolve({
      value: null,
      unit: 'none',
    })
  }

  command(command: string, ...params: any[]): Promise<CommandResult> {
    return Promise.resolve({
      success: false,
      message: `Ooopss... that went wrong. Your weather station does not know the command '${command}'!`,
    })
  }

  summarize(sensor_slug: string, records: StoredRecord[]): StoredRecord | null {
    return null
  }
}
