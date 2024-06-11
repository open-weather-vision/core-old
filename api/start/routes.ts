/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import SensorsController from '#controllers/sensors_controller'
import WeatherStationsController from '#controllers/weather_stations_controller'
import router from '@adonisjs/core/services/router'

router.get('/v1/weather-stations', [WeatherStationsController, 'getAll'])
router.get('/v1/weather-stations/:slug', [WeatherStationsController, 'getOne'])
router.post('/v1/weather-stations/', [WeatherStationsController, 'initialize'])
router.get('/v1/weather-stations/:slug/sensors', [SensorsController, 'getAllOfStation'])
router.get('/v1/weather-stations/:slug/sensors/:sensor_slug', [
  SensorsController,
  'getOneOfStation',
])

router.post('/v1/weather-stations/:slug/sensors/:sensor_slug', [
  SensorsController,
  'writeSensorOfStation',
])

router.get('/v1/weather-stations/:slug/sensors/:sensor_slug/now', [
  SensorsController,
  'readSensorOfStation',
])

router.get('/v1/weather-stations/:slug/sensors/:sensor_slug/:interval', [
  SensorsController,
  'readSensorSummaryOfStation',
])
