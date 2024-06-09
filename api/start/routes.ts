/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import WeatherStationsController from '#controllers/weather_stations_controller'
import router from '@adonisjs/core/services/router'

router.get('/v1/weather-stations', [WeatherStationsController, 'getAll'])
router.get('/v1/weather-stations/:slug', [WeatherStationsController, 'getOne'])
router.post('/v1/weather-stations/', [WeatherStationsController, 'initialize'])
