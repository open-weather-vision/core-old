import Sensor from '#models/sensor'
import UnitConfig from '#models/unit_config'
import WeatherStation from '#models/weather_station'
import { BaseSeeder } from '@adonisjs/lucid/seeders'

export default class extends BaseSeeder {
  async run() {
    await this.create_station("hueff-vp2", "Hüffelsheimer Vantage Pro 2", false);
    await this.create_station("remote-station", "Aachen Station (remote)", true);
  }


 async create_station(slug: string, name: string, remote_recorder: boolean){
    const weather_station = await WeatherStation.create({
      interface: 'davis-vp2',
      interface_config: {
        path: 'COM3',
      },
      state: 'inactive',
      slug,
      name,
      remote_recorder: remote_recorder
    })

    const unit_config = await UnitConfig.create({
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
      weather_station_id: weather_station.id,
    })

    const tempIn = await Sensor.create({
      name: 'Inside temperature',
      slug: 'tempIn',
      interval: 10,
      interval_unit: 'second',
      summary_type: 'min-max-avg',
      unit_type: 'temperature',
      weather_station_id: weather_station.id,
    })

    const tempOut = await Sensor.create({
      name: 'Outside temperature',
      slug: 'tempOut',
      interval: 10,
      interval_unit: 'second',
      summary_type: 'min-max-avg',
      unit_type: 'temperature',
      weather_station_id: weather_station.id,
    })
  }
}
