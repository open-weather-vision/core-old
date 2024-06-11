import { DateTime } from 'luxon'
import { schedule, Schedule, TimeUnit } from './scheduler.js'
import Sensor from '#models/sensor'
import Record from '#models/record'
import SummaryRecord from '#models/summary_record'
import Summary from '#models/summary'
import WeatherStationInterface from './weather_station_interface.js'

export class SummaryCreator {
  private weather_station_id: number
  private update_schedule: Schedule
  private hourly_schedule: Schedule
  private daily_schedule: Schedule
  private weekly_schedule: Schedule
  private monthly_schedule: Schedule
  private yearly_schedule: Schedule
  private station_interface: WeatherStationInterface

  private constructor(weather_station_id: number, station_interface: WeatherStationInterface) {
    this.weather_station_id = weather_station_id
    this.station_interface = station_interface
    this.update_schedule = schedule(this.update.bind(this)).every(5, 'second')
    this.hourly_schedule = schedule(this.hourly.bind(this)).every(1, 'hour')
    this.daily_schedule = schedule(this.daily.bind(this)).every(1, 'day')
    this.weekly_schedule = schedule(this.weekly.bind(this)).every(1, 'week')
    this.monthly_schedule = schedule(this.monthly.bind(this)).every(1, 'month')
    this.yearly_schedule = schedule(this.yearly.bind(this)).every(1, 'year')
  }

  static async create(weather_station_id: number, station_interface: WeatherStationInterface) {
    const summary_creator = new SummaryCreator(weather_station_id, station_interface)
    await summary_creator.create_empty_summaries()
    return summary_creator
  }

  static async createAndStart(
    weather_station_id: number,
    station_interface: WeatherStationInterface
  ) {
    ;(await this.create(weather_station_id, station_interface)).start()
  }

  async create_empty_summaries() {
    await Summary.create({
      created_at: DateTime.now().startOf('hour'),
      type: 'hour',
      weather_station_id: this.weather_station_id,
    })

    await Summary.create({
      created_at: DateTime.now().startOf('day'),
      type: 'day',
      weather_station_id: this.weather_station_id,
    })

    await Summary.create({
      created_at: DateTime.now().startOf('week'),
      type: 'week',
      weather_station_id: this.weather_station_id,
    })

    await Summary.create({
      created_at: DateTime.now().startOf('month'),
      type: 'month',
      weather_station_id: this.weather_station_id,
    })

    await Summary.create({
      created_at: DateTime.now().startOf('year'),
      type: 'year',
      weather_station_id: this.weather_station_id,
    })

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
      this.update_summary('hour', sensor, time)
      this.update_summary('day', sensor, time)
      this.update_summary('week', sensor, time)
      this.update_summary('month', sensor, time)
      this.update_summary('year', sensor, time)
      this.update_summary('alltime', sensor, time)
    }
  }

  private async update_summary(
    interval: Exclude<TimeUnit, 'minute' | 'second'> | 'alltime',
    sensor: Sensor,
    time: DateTime
  ) {
    const value_column = sensor.value_type === 'double' ? 'value_float' : 'value_int'

    // Check summary type
    const max_summary = sensor.summary_type.includes('max')
    const min_summary = sensor.summary_type.includes('min')
    const avg_summary = sensor.summary_type.includes('avg')
    const sum_summary = sensor.summary_type === 'sum'
    const middle_summary = sensor.summary_type === 'middle'
    const latest_summary = sensor.summary_type === 'latest'
    const oldest_summary = sensor.summary_type === 'oldest'
    const custom_summary = sensor.summary_type === 'custom'

    // Build query
    const query = Record[interval]().where('sensor_id', sensor.id)

    if (max_summary || min_summary) {
      query.orderBy(value_column, 'desc')
    } else if (latest_summary || oldest_summary || middle_summary) {
      query.orderBy('created_at', 'desc')
    }

    // Execute query (gets all records for the interval, along with some aggregation information)
    const records = await query.exec()

    // Query the related summary
    const current_summary = await Summary.query()
      .orderBy('created_at', 'desc')
      .where('weather_station_id', this.weather_station_id)
      .andWhere('type', interval)
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
      })
    }

    // Actually fill summary record with information
    if (max_summary || min_summary || avg_summary) {
      if (max_summary) {
        if (records.length !== 0) {
          summary_record.data.max_time = records[0].created_at
          summary_record.data.max_value = records[0].value
        } else {
          summary_record.data.max_time = null
          summary_record.data.max_value = null
        }
      }

      if (min_summary) {
        if (records.length !== 0) {
          summary_record.data.min_time = records[records.length - 1].created_at
          summary_record.data.min_value = records[records.length - 1].value
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
    await Summary.create({
      created_at: time,
      type: 'hour',
      weather_station_id: this.weather_station_id,
    })
  }

  private async daily(time: DateTime) {
    await Summary.create({
      created_at: time,
      type: 'day',
      weather_station_id: this.weather_station_id,
    })
  }

  private async weekly(time: DateTime) {
    await Summary.create({
      created_at: time,
      type: 'week',
      weather_station_id: this.weather_station_id,
    })
  }

  private async monthly(time: DateTime) {
    await Summary.create({
      created_at: time,
      type: 'month',
      weather_station_id: this.weather_station_id,
    })
  }

  private async yearly(time: DateTime) {
    await Summary.create({
      created_at: time,
      type: 'year',
      weather_station_id: this.weather_station_id,
    })
  }
}
