/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import APIController from '#controllers/api_controller'
import SensorsController from '#controllers/sensors_controller'
import SummariesController from '#controllers/summaries_controller'
import WeatherStationsController from '#controllers/weather_stations_controller'
import router from '@adonisjs/core/services/router'

router.get('/v1/weather-stations', [WeatherStationsController, 'get_all'])
router.post('/v1/weather-stations/', [WeatherStationsController, 'initialize'])
router.get('/v1/weather-stations/:slug', [WeatherStationsController, 'get_one'])
router.post('/v1/weather-stations/:slug/up', [WeatherStationsController, 'resume'])
router.post('/v1/weather-stations/:slug/down', [WeatherStationsController, 'pause'])
router.get('/v1/weather-stations/:slug/interface', [WeatherStationsController, 'get_interface'])
router.get('/v1/weather-stations/:slug/sensors', [SensorsController, 'get_all_of_station'])
router.get('/v1/weather-stations/:slug/sensors/:sensor_slug', [
  SensorsController,
  'get_one_of_station',
])

router.post('/v1/weather-stations/:slug/sensors/:sensor_slug', [SensorsController, 'write'])

router.get('/v1/weather-stations/:slug/sensors/:sensor_slug/now', [SensorsController, 'read'])

router.get('/v1/weather-stations/:slug/summaries', [
  SummariesController,
  'get_one_of_multiple_sensors',
])

router.get('/v1/weather-stations/:slug/summaries/now', [
  SummariesController,
  'get_latest_of_multiple_sensors',
])

router.get('/v1/weather-stations/:slug/sensors/:sensor_slug/summaries', [
  SummariesController,
  'get_one',
])

router.get('/v1/weather-stations/:slug/sensors/:sensor_slug/summaries/latest', [
  SummariesController,
  'get_latest_one',
])


router.post('v1/api/shutdown', [
  APIController, 'shutdown'
]);