import { DateTime } from 'luxon'
import { Timeout, clearTimeout, setTimeout } from 'long-timeout'

export type TimeUnit = 'second' | 'minute' | 'hour' | 'day' | 'week' | 'month' | 'year'
export const TimeUnits: TimeUnit[] = ['second', 'minute', 'hour', 'day', 'week', 'month', 'year']

export function previous(interval: Exclude<TimeUnit, 'second'> | 'alltime'): TimeUnit {
  switch (interval) {
    case 'minute':
      return 'second'
    case 'hour':
      return 'minute'
    case 'day':
      return 'hour'
    case 'week':
      return 'day'
    case 'month':
      return 'week'
    case 'year':
      return 'month'
    case 'alltime':
      return 'year'
  }
}

export class Schedule {
  interval: number = 1
  unit: TimeUnit = 'second'
  action: (time: DateTime) => void
  align: boolean
  timeout_id?: Timeout
  running: boolean = false

  constructor(action: (time: DateTime) => void, options: { align?: boolean } = { align: true }) {
    this.action = action
    this.align = options.align ?? true
  }

  every(interval: number, unit: TimeUnit) {
    this.interval = interval
    this.unit = unit

    return this
  }

  nextScheduleTime() {
    let nextScheduleTime = DateTime.now()
    switch (this.unit) {
      case 'second':
        if (this.align) nextScheduleTime = nextScheduleTime.set({ millisecond: 0 })
        nextScheduleTime = nextScheduleTime.plus({
          seconds: this.interval,
        })
        break
      case 'minute':
        if (this.align)
          nextScheduleTime = nextScheduleTime.set({
            millisecond: 0,
            second: 0,
          })
        nextScheduleTime = nextScheduleTime.plus({
          minutes: this.interval,
        })
        break
      case 'hour':
        if (this.align)
          nextScheduleTime = nextScheduleTime.set({
            millisecond: 0,
            second: 0,
            minute: 0,
          })
        nextScheduleTime = nextScheduleTime.plus({
          hours: this.interval,
        })
        break
      case 'day':
        if (this.align)
          nextScheduleTime = nextScheduleTime.set({
            millisecond: 0,
            second: 0,
            minute: 0,
            hour: 0,
          })
        nextScheduleTime = nextScheduleTime.plus({
          days: this.interval,
        })
        break
      case 'week':
        if (this.align) {
          nextScheduleTime = nextScheduleTime.set({
            millisecond: 0,
            second: 0,
            minute: 0,
            hour: 0,
            localWeekday: 1,
          })
        }
        nextScheduleTime = nextScheduleTime.plus({
          days: this.interval * 7,
        })
        break
      case 'month':
        if (this.align) {
          nextScheduleTime = nextScheduleTime.set({
            millisecond: 0,
            second: 0,
            minute: 0,
            hour: 0,
            day: 1,
          })
        }
        nextScheduleTime = nextScheduleTime.plus({
          month: this.interval,
        })
        break
      case 'year':
        if (this.align) {
          nextScheduleTime = nextScheduleTime.set({
            millisecond: 0,
            second: 0,
            minute: 0,
            hour: 0,
            day: 1,
            month: 1,
          })
        }
        nextScheduleTime = nextScheduleTime.plus({
          years: this.interval,
        })
        break
    }
    return nextScheduleTime
  }

  start() {
    this.running = true

    const nextScheduleTime = this.nextScheduleTime()
    const nextScheduleMilliseconds = nextScheduleTime.diffNow().milliseconds
    this.timeout_id = setTimeout(() => {
      this.action(nextScheduleTime)
      if (this.running) this.start()
    }, nextScheduleMilliseconds)
  }

  stop() {
    this.running = false
    if (this.timeout_id) clearTimeout(this.timeout_id)
  }
}

export function schedule(action: (time: DateTime) => void) {
  return new Schedule(action)
}
