export type SensorSummaryType =
  | 'max'
  | 'min'
  | 'min-max'
  | 'min-max-avg'
  | 'avg'
  | 'pick-middle'
  | 'pick-latest'
  | 'pick-oldest'
  | 'sum'
  | 'custom'

export const SensorSummaryTypes: SensorSummaryType[] = [
  'max',
  'min',
  'min-max',
  'min-max-avg',
  'avg',
  'pick-middle',
  'pick-latest',
  'pick-oldest',
  'sum',
  'custom',
]

export type SummaryType = 'hour' | 'day' | 'week' | 'month' | 'year'
export const SummaryTypes = ['hour', 'day', 'week', 'month', 'year']
