import Record from '#models/record'
import Summary from '#models/summary'
import SummaryRecord from '#models/summary_record'
import { DateTime } from 'luxon'
import { SummaryType, SummaryTypes } from './summaries/summary_types.js'
import UnitConfig from '#models/unit_config'
import WeatherStation from '#models/weather_station'
import { WeatherStationInterface } from './weather_station_interface.js'
import Sensor from '#models/sensor'
import { Logger } from '@adonisjs/core/logger'

export class SummaryCreator {
  private latest_record_time?: DateTime
  private current_hour_summary?: Summary
  private current_day_summary?: Summary
  private current_week_summary?: Summary
  private current_month_summary?: Summary
  private current_year_summary?: Summary
  private current_alltime_summary?: Summary

  private weather_station_id: number
  private unit_config?: UnitConfig
  private station_interface: WeatherStationInterface

  private logger: Logger

  constructor(
    weather_station_id: number,
    station_interface: WeatherStationInterface,
    logger: Logger
  ) {
    this.weather_station_id = weather_station_id
    this.station_interface = station_interface
    this.logger = logger
  }

  private async load_unit_config() {
    const result = await WeatherStation.query()
      .where('id', this.weather_station_id)
      .preload('unit_config')
      .first()

    this.unit_config = result?.unit_config ?? (await UnitConfig.global_unit_config())
  }

  async start() {
    await this.load_unit_config()
    this.latest_record_time = DateTime.now()

    const current_times = {
      hour: this.latest_record_time.startOf('hour'),
      day: this.latest_record_time.startOf('day'),
      week: this.latest_record_time.startOf('week'),
      month: this.latest_record_time.startOf('month'),
      year: this.latest_record_time.startOf('year'),
      alltime: this.latest_record_time,
    }

    for (const type of SummaryTypes) {
      await this.create_current_summary_if_not_existing(type, current_times[type])
    }
  }

  private async create_current_summary_if_not_existing(
    type: SummaryType,
    interval_start: DateTime
  ) {
    const latest_summary = await Summary.latest(type)
    if (
      latest_summary !== null &&
      (+latest_summary.created_at === +interval_start || type === 'alltime')
    ) {
      this[`current_${type}_summary`] = latest_summary
    } else {
      this[`current_${type}_summary`] = await Summary.create({
        created_at: interval_start,
        type,
        weather_station_id: this.weather_station_id,
      })
      for (const sensor_slug in this.station_interface.sensors) {
        const sensor = await Sensor.query()
          .where('weather_station_id', this.weather_station_id)
          .andWhere('slug', sensor_slug)
          .firstOrFail()
        await SummaryRecord.createForSensor(
          sensor,
          this[`current_${type}_summary`]!.id,
          this.unit_config!.of_type(sensor.unit_type)
        )
      }
    }
  }

  private async create_new_summary_if_new_interval_started(
    type: SummaryType,
    interval_start: DateTime
  ) {
    if (+interval_start !== +this[`current_${type}_summary`]!.created_at) {
      this.logger.info(
        `New '${type}' for weather station '${(await WeatherStation.find(this.weather_station_id))?.slug}': Created new summary!`
      )
      this[`current_${type}_summary`] = await Summary.create({
        created_at: interval_start,
        type: type,
        weather_station_id: this.weather_station_id,
      })
      for (const sensor_slug in this.station_interface.sensors) {
        const sensor = await Sensor.query()
          .where('weather_station_id', this.weather_station_id)
          .andWhere('slug', sensor_slug)
          .firstOrFail()
        await SummaryRecord.createForSensor(
          sensor,
          this[`current_${type}_summary`]!.id,
          this.unit_config!.of_type(sensor.unit_type)
        )
      }
    }
  }

  public async process_record(record: Record): Promise<boolean> {
    if (+record.created_at < +this.latest_record_time!) {
      // if record is not after the record before the record is invalid
      record.delete()
      return false
    }

    this.latest_record_time = record.created_at

    const record_times = {
      hour: record.created_at.startOf('hour'),
      day: record.created_at.startOf('day'),
      week: record.created_at.startOf('week'),
      month: record.created_at.startOf('month'),
      year: record.created_at.startOf('year'),
    }

    // Create new summary if necessary
    for (const type of SummaryTypes) {
      if (type !== 'alltime')
        await this.create_new_summary_if_new_interval_started(type, record_times[type])
    }

    // Load sensor information
    await record.load('sensor')

    // Update sensor summary records
    for (const type of SummaryTypes) {
      await this.update_current_summary_record(type, record)
    }

    return true
  }

  private async update_current_summary_record(type: SummaryType, record: Record) {
    const summary_type_info = record.sensor.get_type_information()
    const summary_record = await SummaryRecord.query()
      .where('sensor_id', record.sensor_id)
      .andWhere('summary_id', this[`current_${type}_summary`]!.id)
      .firstOrFail()

    if (
      summary_type_info.max_summary ||
      summary_type_info.min_summary ||
      summary_type_info.avg_summary
    ) {
      if (summary_type_info.max_summary) {
        if (
          summary_record.data.max_value === null ||
          summary_record.data.max_value === undefined ||
          (record.value !== null && record.value > summary_record.data.max_value)
        ) {
          summary_record.data.max_value = record.value
          summary_record.data.max_time = record.created_at
        }
      }

      if (summary_type_info.min_summary) {
        if (
          summary_record.data.min_value === null ||
          summary_record.data.min_value === undefined ||
          (record.value !== null && record.value < summary_record.data.min_value)
        ) {
          summary_record.data.min_value = record.value
          summary_record.data.min_time = record.created_at
        }
      }

      if (summary_type_info.avg_summary) {
        if (summary_record.data.avg_value === null || summary_record.data.avg_value === undefined) {
          summary_record.data.avg_value = record.value
        } else if (record.value !== null) {
          summary_record.data.avg_value =
            (summary_record.data.avg_value * summary_record.data.valid_record_count +
              record.value) /
            (summary_record.data.valid_record_count + 1)
        }
      }
    } else if (summary_type_info.sum_summary) {
      if (summary_record.data.value === null || summary_record.data.value === undefined) {
        summary_record.data.value = record.value
      } else if (record.value !== null) {
        summary_record.data.value += record.value
      }
    } else if (summary_type_info.latest_summary) {
      if (
        summary_record.data.value === null ||
        summary_record.data.value === undefined ||
        record.value !== null
      ) {
        summary_record.data.value = record.value
        summary_record.data.time = record.created_at
      }
    } else if (summary_type_info.oldest_summary) {
      if (summary_record.data.value === null || summary_record.data.value === undefined) {
        summary_record.data.value = record.value
        summary_record.data.time = record.created_at
      }
    } else if (summary_type_info.custom_summary) {
      // TODO!
    }

    summary_record.data.record_count++
    summary_record.data.latest_update = record.created_at
    if (record.value !== null) {
      summary_record.data.valid_record_count++
      summary_record.data.latest_valid_update = record.created_at
    }

    await summary_record.save()
  }
}
