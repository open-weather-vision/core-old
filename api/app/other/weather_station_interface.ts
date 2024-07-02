import { DateTime } from 'luxon'
import { TimeUnit } from './scheduler.js'
import { SensorSummaryType, SummaryType } from './summaries/summary_types.js'
import { Unit, UnitType } from './units/units.js'

export type ISensorDescription = {
  name: string
  tags: string[]
  summary_type: SensorSummaryType
  interval: number
  interval_unit: TimeUnit
  unit_type: UnitType
}

export type ISensorsDescription = { [Property in string]: ISensorDescription }

export type IStoredRecord = {
  value: number | null
  created_at: DateTime | null
}

export type IRecord = IRawRecord & {
  created_at: DateTime,
  sensor_slug: string,
}

export type IRawRecord = {
  /** The sensor's value (null = error / none) */
  value: number | null
  /** The sensor's unit */
  unit: Unit | 'none'
}

export type ICommandResult = {
  /** Whether the command has been executed successfully */
  success: boolean
  /** A meaningful message (displayed to the command user) */
  message: string
  /** Additional data */
  data?: any
}

/**
 * Blueprint for an interface to any kind of weather station.
 */
export class WeatherStationInterface {
  /**
   * Information about all sensors the weather station offers.
   */
  sensors: ISensorsDescription = {}

  /**
   * Interface configuration, can be changed by the user
   */
  config: any

  constructor(config: any) {
    this.config = config
  }

  /**
   * In this function you should connect to your weather station
   * @returns whether everything went fine
   */
  connect(): Promise<boolean> {
    return Promise.resolve(true)
  }

  /**
   * Should create a record for the given sensor. You have to return a record. If recording fails return `{
   * value: null, unit: 'none' }` You don't need to
   * convert the record to the configured unit in the owvision api, this is handled by the owvision api.
   * @param sensor_slug the sensor
   * @returns a record
   */
  record(sensor_slug: string): Promise<IRawRecord> {
    return Promise.resolve({
      value: null,
      unit: 'none',
    })
  }

  /**
   * Should execute a command on the weather station. You have to return a `ICommandResult`.
   * @param command the command's name
   * @param params option parameters
   * @returns a command result
   */
  command(command: string, ...params: any[]): Promise<ICommandResult> {
    return Promise.resolve({
      success: false,
      message: `Ooopss... that went wrong. Your weather station does not know the command '${command}'!`,
    })
  }

  /**
   * TODO: Fix!!!!
   */
  summarize(sensor_slug: string, records: IStoredRecord[]): IStoredRecord | null {
    return null
  }
}
