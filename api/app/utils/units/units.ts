/**
 * A supported rain unit. The default rain unit is `"in"`.
 */
export type PrecipationUnit = 'in' | 'mm'
/** Array holding all supported rain units. */
export const PrecipationUnits: PrecipationUnit[] = ['in', 'mm']

/**
 * A supported elevation unit. The default elevation unit is `"in"`.
 */
export type ElevationUnit = 'in' | 'm'
/** Array holding all supported elevation units. */
export const ElevationUnits: ElevationUnit[] = ['in', 'm']

/**
 * A supported wind unit. The default wind unit is `"mph"`.
 */
export type WindUnit = 'km/h' | 'mph' | 'ft/s' | 'knots' | 'Bft' | 'm/s'
/** Array holding all supported wind units. */
export const WindUnits: WindUnit[] = ['km/h', 'mph', 'ft/s', 'knots', 'Bft', 'm/s']

/**
 * A supported temperature unit. The default temperature unit is `"°F"`.
 */
export type TemperatureUnit = '°C' | '°F'
/** Array holding all supported wind units. */
export const TemperatureUnits: TemperatureUnit[] = ['°C', '°F']

/**
 * A supported solar radiation unit. The default solar radiation unit is `"W/m²"`.
 */
export type SolarRadiationUnit = 'W/m²'
/** Array holding all supported solar radiation units. */
export const SolarRadiationUnits: SolarRadiationUnit[] = ['W/m²']

/**
 * A supported pressure unit. The default pressure unit is `"inHg"`.
 */
export type PressureUnit = 'hPa' | 'inHg' | 'mmHg' | 'mb'
/** Array holding all supported pressure units. */
export const PressureUnits: PressureUnit[] = ['hPa', 'inHg', 'mmHg', 'mb']

/**
 * A supported soil moisture unit. The default pressure unit is `"cb"` (centibar).
 */
export type SoilMoistureUnit = 'cb'
/** Array holding all supported soil moisture units. */
export const SoilMoistureUnits: SoilMoistureUnit[] = ['cb']

/**
 * A supported humidity unit. The default pressure unit is `"%"`.
 */
export type HumidityUnit = '%'
/** Array holding all supported humidity units. */
export const HumidityUnits: HumidityUnit[] = ['%']

export interface UnitConfiguration {
  /** The desired rain unit. Default is `in`. */
  rain: PrecipationUnit
  /** The desired wind unit. Default is `mph`. */
  wind: WindUnit
  /** The desired temperature unit. Default is `°F`. */
  temperature: TemperatureUnit
  /** The desired solar radiation unit. Default is `W/m²`. */
  solarRadiation: SolarRadiationUnit
  /** The desired pressure unit. Default is `inHg`. */
  pressure: PressureUnit
  /** The desired soil moisture unit. Default is `cb`. */
  soilMoisture: SoilMoistureUnit
  /** The desired leaf temperature unit. Default is `°F`. */
  leafTemperature: TemperatureUnit
  /** The desired soil temperature unit. Default is `°F`. */
  soilTemperature: TemperatureUnit
  /** The desired evo transpiration unit. Default is `in`. */
  evoTranspiration: PrecipationUnit
  /** The desired humidity unit. Default is `%`. */
  humidity: HumidityUnit
  /** The desired elevation unit. Default is `in`. */
  elevation: ElevationUnit
}

export type UnitType = keyof UnitConfiguration | 'none'

export const UnitTypes: UnitType[] = [
  'rain',
  'wind',
  'temperature',
  'solarRadiation',
  'pressure',
  'soilMoisture',
  'leafTemperature',
  'soilTemperature',
  'evoTranspiration',
  'humidity',
  'elevation',
  'none',
]

export type UnitSettings = Readonly<UnitConfiguration>
