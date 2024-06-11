import { SensorValueType } from '#models/sensor'
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
  value_type: SensorValueType
}

export type SensorsDescription = { [Property in string]: SensorDescription }

export type SimpleRecord = {
  value: number | null
  created_at: DateTime
}

export type SimpleRecordWithUnit = {
  value: number | null
  unit?: Unit
  created_at: DateTime
}

export type CommandResult = {
  success: boolean
  message: string
  data?: any
}

export default abstract class WeatherStationInterface {
  abstract sensors: SensorsDescription
  config: any

  constructor(config: any) {
    this.config = config
  }

  abstract connect(): Promise<boolean>

  abstract record(sensor_slug: string): Promise<number | null>

  command(command: string, ...params: any[]): Promise<CommandResult> {
    return Promise.resolve({
      success: false,
      message: `Ooopss... that went wrong. Your weather station does not know the command '${command}'!`,
    })
  }

  summarize(sensor_slug: string, records: SimpleRecord[]): SimpleRecord | null {
    return null
  }
}
