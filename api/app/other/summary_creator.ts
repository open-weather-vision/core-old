import { DateTime } from 'luxon'
import { previous, schedule, Schedule, TimeUnit } from './scheduler.js'
import Sensor from '#models/sensor'
import Record from '#models/record'
import SummaryRecord from '#models/summary_record'
import Summary from '#models/summary'
import WeatherStationInterfaceA from './weather_station_interface.js'
import WeatherStation from '#models/weather_station'
import { SummaryType } from './summaries/summary_types.js'
import UnitConfig from '#models/unit_config'

export class SummaryCreator {
  private weather_station_id: number
  private update_schedule: Schedule
  private hourly_schedule: Schedule
  private daily_schedule: Schedule
  private weekly_schedule: Schedule
  private monthly_schedule: Schedule
  private yearly_schedule: Schedule
  private station_interface: WeatherStationInterfaceA
  private unit_config!: UnitConfig

  private async load_unit_config() {
    const result = await WeatherStation.query()
      .where('id', this.weather_station_id)
      .preload('unit_config')
      .first()

    this.unit_config = result?.unit_config ?? (await UnitConfig.global_unit_config())
  }

  private constructor(weather_station_id: number, station_interface: WeatherStationInterfaceA) {
    this.weather_station_id = weather_station_id
    this.station_interface = station_interface
    this.update_schedule = schedule(this.update.bind(this)).every(5, 'second')
    this.hourly_schedule = schedule(this.hourly.bind(this)).every(1, 'hour')
    this.daily_schedule = schedule(this.daily.bind(this)).every(1, 'day')
    this.weekly_schedule = schedule(this.weekly.bind(this)).every(1, 'week')
    this.monthly_schedule = schedule(this.monthly.bind(this)).every(1, 'month')
    this.yearly_schedule = schedule(this.yearly.bind(this)).every(1, 'year')
  }

  static async create(weather_station_id: number, station_interface: WeatherStationInterfaceA) {
    const summary_creator = new SummaryCreator(weather_station_id, station_interface)
    await summary_creator.load_unit_config()
    await summary_creator.create_empty_summaries()
    return summary_creator
  }

  static async createAndStart(
    weather_station_id: number,
    station_interface: WeatherStationInterfaceA
  ) {
    ;(await this.create(weather_station_id, station_interface)).start()
  }

  async create_empty_summaries() {
    for (const interval of ['hour', 'day', 'week', 'month', 'year'] as (TimeUnit & SummaryType)[]) {
      if (
        !(await Summary.current(interval)
          .andWhere('weather_station_id', this.weather_station_id)
          .first())
      ) {
        await Summary.create({
          created_at: DateTime.now().startOf(interval),
          type: interval,
          weather_station_id: this.weather_station_id,
        })
      }
    }

    if (
      !(await Summary.query()
        .andWhere('weather_station_id', this.weather_station_id)
        .andWhere('type', 'alltime')
        .first())
    )
      await Summary.create({
        created_at: DateTime.now().startOf('minute'),
        type: 'alltime',
        weather_station_id: this.weather_station_id,
      })
  }

  start() {
    this.update_schedule.start()
    this.hourly_schedule.start()
    this.daily_schedule.start()
    this.weekly_schedule.start()
    this.monthly_schedule.start()
    this.yearly_schedule.start()
  }

  stop() {
    this.update_schedule.stop()
    this.hourly_schedule.stop()
    this.daily_schedule.stop()
    this.weekly_schedule.stop()
    this.monthly_schedule.stop()
    this.yearly_schedule.stop()
  }

  private async update(time: DateTime) {
    const sensors = await Sensor.query().where('weather_station_id', this.weather_station_id)

    for (const sensor of sensors) {
      await this.update_hourly_summary(sensor, time)
      await this.update_summary('day', sensor, time)
      await this.update_summary('week', sensor, time)
      await this.update_summary('month', sensor, time)
      await this.update_summary('year', sensor, time)
      await this.update_summary('alltime', sensor, time)
    }
  }

  private async update_summary(
    interval: Exclude<TimeUnit, 'hour' | 'second' | 'minute'> | 'alltime',
    sensor: Sensor,
    time: DateTime
  ) {
    // Check summary type
    const max_summary = sensor.summary_type.includes('max')
    const min_summary = sensor.summary_type.includes('min')
    const avg_summary = sensor.summary_type.includes('avg')
    const sum_summary = sensor.summary_type === 'sum'
    const middle_summary = sensor.summary_type === 'middle'
    const latest_summary = sensor.summary_type === 'latest'
    const oldest_summary = sensor.summary_type === 'oldest'
    const custom_summary = sensor.summary_type === 'custom'

    // Query the related summary
    const current_summary = await Summary.query()
      .orderBy('created_at', 'desc')
      .where('weather_station_id', this.weather_station_id)
      .andWhere('type', interval)
      .firstOrFail()

    // Query the related summaries of the smaller interval
    const query = Summary.query()
      .orderBy('created_at', 'desc')
      .where('weather_station_id', this.weather_station_id)
      .andWhere('type', previous(interval))

    if (interval !== 'alltime') {
      query.andWhere('created_at', '>=', current_summary.created_at.toString())
      query.andWhere('created_at', '<', time.toString())
    }

    const child_summaries = await query.exec()

    // Query the related summary records of the smaller interval
    const child_summaries_records = await SummaryRecord.query()
      .whereIn(
        'summary_id',
        child_summaries.map((summary) => summary.id)
      )
      .andWhere('sensor_id', sensor.id)
      .orderBy('id')
      .exec()

    // Query the related sensor's summary record
    let summary_record = await SummaryRecord.query()
      .where('sensor_id', sensor.id)
      .where('summary_id', current_summary.id)
      .first()

    // If not existing (happens on every interval start)
    if (!summary_record) {
      summary_record = await SummaryRecord.create({
        data: {},
        sensor_id: sensor.id,
        summary_id: current_summary.id,
        unit: this.unit_config!.of_type(sensor.unit_type),
      })
    }

    // Actually fill summary record with information
    if (max_summary || min_summary || avg_summary) {
      if (max_summary) {
        if (child_summaries_records.length !== 0) {
          const max_record = child_summaries_records.reduce((max_record, record) =>
            (record.data.max_value ?? Number.MIN_VALUE) >
            (max_record.data.max_value ?? Number.MIN_VALUE)
              ? record
              : max_record
          )
          summary_record.data.max_time = max_record.data.max_time
          summary_record.data.max_value = max_record.data.max_value
        } else {
          summary_record.data.max_time = null
          summary_record.data.max_value = null
        }
      }

      if (min_summary) {
        if (child_summaries_records.length !== 0) {
          const min_record = child_summaries_records.reduce((min_record, record) =>
            (record.data.min_value ?? Number.MAX_VALUE) <
            (min_record.data.min_value ?? Number.MAX_VALUE)
              ? record
              : min_record
          )
          summary_record.data.min_time = min_record.data.min_time
          summary_record.data.min_value = min_record.data.min_value
        } else {
          summary_record.data.min_time = null
          summary_record.data.min_value = null
        }
      }

      if (avg_summary) {
        let entries_without_null = 0
        summary_record.data.avg_value = null
        for (const record of child_summaries_records) {
          if (record.data.avg_value == null) continue
          entries_without_null++
          if (summary_record.data.avg_value === null) {
            summary_record.data.avg_value = record.data.avg_value
          } else {
            summary_record.data.avg_value += record.data.avg_value
          }
        }
        if (summary_record.data.avg_value) summary_record.data.avg_value /= entries_without_null
      }
    } else if (sum_summary) {
      summary_record.data.time = time
      summary_record.data.value = null
      for (const record of child_summaries_records) {
        if (record.data.value == null) continue
        if (summary_record.data.value === null) {
          summary_record.data.value = record.data.value
        } else {
          summary_record.data.value += record.data.value
        }
      }
    } else if (latest_summary) {
      if (child_summaries_records.length != 0) {
        summary_record.data.time = child_summaries_records[0].data.time
        summary_record.data.value = child_summaries_records[0].data.value
      } else {
        summary_record.data.time = null
        summary_record.data.value = null
      }
    } else if (oldest_summary) {
      if (child_summaries_records.length != 0) {
        summary_record.data.time =
          child_summaries_records[child_summaries_records.length - 1].data.time
        summary_record.data.value =
          child_summaries_records[child_summaries_records.length - 1].data.value
      } else {
        summary_record.data.time = null
        summary_record.data.value = null
      }
    } else if (middle_summary) {
      if (child_summaries_records.length != 0) {
        const middle_index = Math.floor(child_summaries_records.length / 2)
        summary_record.data.time = child_summaries_records[middle_index].data.time
        summary_record.data.value = child_summaries_records[middle_index].data.value
      } else {
        summary_record.data.time = null
        summary_record.data.value = null
      }
    } else if (custom_summary) {
      // TODO: Error Handling
      const simple_summarized_record = this.station_interface.summarize(
        sensor.slug,
        child_summaries_records.map((record) => ({
          value: record.data.value ?? null,
          created_at: record.data.time ?? null,
        }))
      )!
      summary_record.data.time = simple_summarized_record?.created_at
      summary_record.data.value = simple_summarized_record?.value
    }

    await summary_record.save()
  }

  private async update_hourly_summary(sensor: Sensor, time: DateTime) {
    // Check summary type
    const max_summary = sensor.summary_type.includes('max')
    const min_summary = sensor.summary_type.includes('min')
    const avg_summary = sensor.summary_type.includes('avg')
    const sum_summary = sensor.summary_type === 'sum'
    const middle_summary = sensor.summary_type === 'middle'
    const latest_summary = sensor.summary_type === 'latest'
    const oldest_summary = sensor.summary_type === 'oldest'
    const custom_summary = sensor.summary_type === 'custom'

    // Query all records for the current hour
    const records = await Record.current('hour', time)
      .where('sensor_id', sensor.id)
      .orderBy('created_at', 'desc')

    // Query the related summary
    const current_summary = await Summary.query()
      .orderBy('created_at', 'desc')
      .where('weather_station_id', this.weather_station_id)
      .andWhere('type', 'hour')
      .firstOrFail()

    // Query the related sensor's summary record
    let summary_record = await SummaryRecord.query()
      .where('sensor_id', sensor.id)
      .where('summary_id', current_summary.id)
      .first()

    // If not existing (happens on every interval start)
    if (!summary_record) {
      summary_record = await SummaryRecord.create({
        data: {},
        sensor_id: sensor.id,
        summary_id: current_summary.id,
        unit: this.unit_config!.of_type(sensor.unit_type),
      })
    }

    // Actually fill summary record with information
    if (max_summary || min_summary || avg_summary) {
      if (max_summary) {
        if (records.length !== 0) {
          const max_record = records.reduce((max_record, record) =>
            (record.value ?? Number.MIN_VALUE) > (max_record.value ?? Number.MIN_VALUE)
              ? record
              : max_record
          )
          summary_record.data.max_time = max_record.created_at
          summary_record.data.max_value = max_record.value
        } else {
          summary_record.data.max_time = null
          summary_record.data.max_value = null
        }
      }

      if (min_summary) {
        if (records.length !== 0) {
          const min_record = records.reduce((min_record, record) =>
            (record.value ?? Number.MAX_VALUE) < (min_record.value ?? Number.MAX_VALUE)
              ? record
              : min_record
          )
          summary_record.data.min_time = min_record.created_at
          summary_record.data.min_value = min_record.value
        } else {
          summary_record.data.min_time = null
          summary_record.data.min_value = null
        }
      }

      if (avg_summary) {
        let entries_without_null = 0
        summary_record.data.avg_value = null
        for (const record of records) {
          if (record.value == null) continue
          entries_without_null++
          if (summary_record.data.avg_value === null) {
            summary_record.data.avg_value = record.value
          } else {
            summary_record.data.avg_value += record.value
          }
        }
        if (summary_record.data.avg_value) summary_record.data.avg_value /= entries_without_null
      }
    } else if (sum_summary) {
      summary_record.data.time = time
      summary_record.data.value = null
      for (const record of records) {
        if (record.value == null) continue
        if (summary_record.data.value === null) {
          summary_record.data.value = record.value
        } else {
          summary_record.data.value += record.value
        }
      }
    } else if (latest_summary) {
      if (records.length != 0) {
        summary_record.data.time = records[0].created_at
        summary_record.data.value = records[0].value
      } else {
        summary_record.data.time = null
        summary_record.data.value = null
      }
    } else if (oldest_summary) {
      if (records.length != 0) {
        summary_record.data.time = records[records.length - 1].created_at
        summary_record.data.value = records[records.length - 1].value
      } else {
        summary_record.data.time = null
        summary_record.data.value = null
      }
    } else if (middle_summary) {
      if (records.length != 0) {
        const middle_index = Math.floor(records.length / 2)
        summary_record.data.time = records[middle_index].created_at
        summary_record.data.value = records[middle_index].value
      } else {
        summary_record.data.time = null
        summary_record.data.value = null
      }
    } else if (custom_summary) {
      // TODO: Error Handling
      const simple_summarized_record = this.station_interface.summarize(sensor.slug, records)!
      summary_record.data.time = simple_summarized_record?.created_at
      summary_record.data.value = simple_summarized_record?.value
    }

    await summary_record.save()
  }

  private async hourly(time: DateTime) {
    const station = await WeatherStation.query()
      .where('id', this.weather_station_id)
      .preload('sensors')
      .firstOrFail()
    for (const sensor of station.sensors) {
      await this.update_hourly_summary(sensor, time.minus({ milliseconds: 1 }))
    }

    await Summary.create({
      created_at: time,
      type: 'hour',
      weather_station_id: this.weather_station_id,
    })
  }

  private async daily(time: DateTime) {
    const station = await WeatherStation.query()
      .where('id', this.weather_station_id)
      .preload('sensors')
      .firstOrFail()
    for (const sensor of station.sensors) {
      await this.update_summary('day', sensor, time.minus({ milliseconds: 1 }))
    }

    await Summary.create({
      created_at: time,
      type: 'day',
      weather_station_id: this.weather_station_id,
    })
  }

  private async weekly(time: DateTime) {
    const station = await WeatherStation.query()
      .where('id', this.weather_station_id)
      .preload('sensors')
      .firstOrFail()
    for (const sensor of station.sensors) {
      await this.update_summary('week', sensor, time.minus({ milliseconds: 1 }))
    }

    await Summary.create({
      created_at: time,
      type: 'week',
      weather_station_id: this.weather_station_id,
    })
  }

  private async monthly(time: DateTime) {
    const station = await WeatherStation.query()
      .where('id', this.weather_station_id)
      .preload('sensors')
      .firstOrFail()
    for (const sensor of station.sensors) {
      await this.update_summary('month', sensor, time.minus({ milliseconds: 1 }))
    }

    await Summary.create({
      created_at: time,
      type: 'month',
      weather_station_id: this.weather_station_id,
    })
  }

  private async yearly(time: DateTime) {
    const station = await WeatherStation.query()
      .where('id', this.weather_station_id)
      .preload('sensors')
      .firstOrFail()
    for (const sensor of station.sensors) {
      await this.update_summary('year', sensor, time.minus({ milliseconds: 1 }))
    }

    await Summary.create({
      created_at: time,
      type: 'year',
      weather_station_id: this.weather_station_id,
    })
  }
}
