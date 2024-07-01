import { TimeUnit } from '../scheduler.js'

export type SensorSummaryType =
  | 'max'
  | 'min'
  | 'min-max'
  | 'min-avg'
  | 'max-avg'
  | 'min-max-avg'
  | 'avg'
  | 'latest'
  | 'oldest'
  | 'sum'
  | 'custom'

export const SensorSummaryTypes: SensorSummaryType[] = [
  'max',
  'min',
  'min-max',
  'min-avg',
  'max-avg',
  'min-max-avg',
  'avg',
  'latest',
  'oldest',
  'sum',
  'custom',
]

export type SummaryType = Exclude<TimeUnit, 'second' | 'minute'> | 'alltime'
export const SummaryTypes: SummaryType[] = ['hour', 'day', 'week', 'month', 'year', 'alltime']
