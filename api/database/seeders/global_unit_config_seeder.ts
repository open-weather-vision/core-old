import UnitConfig from '#models/unit_config'
import { BaseSeeder } from '@adonisjs/lucid/seeders'

export default class extends BaseSeeder {
  async run() {
    await UnitConfig.create({
      temperature_unit: '°C',
      elevation_unit: 'm',
      evo_transpiration_unit: 'mm',
      humidity_unit: '%',
      leaf_temperature_unit: '°C',
      precipation_unit: 'mm',
      pressure_unit: 'hPa',
      soil_moisture_unit: 'cb',
      soil_temperature_unit: '°C',
      solar_radiation_unit: 'W/m²',
      wind_unit: 'km/h',
      global: true,
    })
  }
}
