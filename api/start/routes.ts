/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import APIController from '#controllers/api_controller'
import AuthController from '#controllers/auth_controller'
import SensorsController from '#controllers/sensors_controller'
import SummariesController from '#controllers/summaries_controller'
import WeatherStationsController from '#controllers/weather_stations_controller'
import router from '@adonisjs/core/services/router'
import { middleware } from './kernel.js'
import StationInterfacesController from '#controllers/station_interfaces_controller'

router
  .get('/v1/weather-stations', [WeatherStationsController, 'get_all'])
  .use(middleware.userAuthentication())
router.post('/v1/weather-stations/', [WeatherStationsController, 'initialize']).use(
  middleware.userAuthentication({
    min_role: 'admin',
  })
)
router.delete('/v1/weather-stations/:slug', [WeatherStationsController, 'delete']).use(
  middleware.userAuthentication({
    min_role: 'admin',
  })
)
router
  .get('/v1/weather-stations/:slug', [WeatherStationsController, 'get_one'])
  .use(middleware.userAuthentication())
router
  .get('/v1/weather-stations/:slug/target_state', [
    WeatherStationsController,
    'get_station_target_state',
  ])
  .use(middleware.userAuthentication())
router
  .get('/v1/weather-stations/:slug/connection_state', [
    WeatherStationsController,
    'get_station_connection_state',
  ])
  .use(middleware.userAuthentication())
router
  .post('/v1/weather-stations/:slug/connection_state', [
    WeatherStationsController,
    'set_station_connection_state',
  ])
  .use(
    middleware.userAuthentication({
      min_role: 'recorder',
    })
  )
router.post('/v1/weather-stations/:slug/up', [WeatherStationsController, 'resume']).use(
  middleware.userAuthentication({
    min_role: 'admin',
  })
)
router.post('/v1/weather-stations/:slug/down', [WeatherStationsController, 'pause']).use(
  middleware.userAuthentication({
    min_role: 'admin',
  })
)

// INTERFACES
router.get('/v1/interfaces', [StationInterfacesController, 'get_all_interfaces']).use(
  middleware.userAuthentication({
    min_role: 'admin',
  })
)
router.get('/v1/interfaces/:slug', [StationInterfacesController, 'get_interface_zip']).use(
  middleware.userAuthentication({
    min_role: 'recorder',
  })
)
router.post('/v1/interfaces', [StationInterfacesController, 'install_interface']).use(
  middleware.userAuthentication({
    min_role: 'admin',
  })
)
router.delete('/v1/interfaces/:slug', [StationInterfacesController, 'uninstall_interface']).use(
  middleware.userAuthentication({
    min_role: 'admin',
  })
)

router
  .get('/v1/weather-stations/:slug/sensors', [SensorsController, 'get_all_of_station'])
  .use(middleware.userAuthentication())
router
  .get('/v1/weather-stations/:slug/sensors/:sensor_slug', [SensorsController, 'get_one_of_station'])
  .use(middleware.userAuthentication())

router.post('/v1/weather-stations/:slug/sensors/:sensor_slug', [SensorsController, 'write']).use(
  middleware.userAuthentication({
    min_role: 'recorder',
  })
)

router
  .get('/v1/weather-stations/:slug/sensors/:sensor_slug/now', [SensorsController, 'read'])
  .use(middleware.userAuthentication())

router
  .get('/v1/weather-stations/:slug/summaries', [SummariesController, 'get_one_of_multiple_sensors'])
  .use(middleware.userAuthentication())

router
  .get('/v1/weather-stations/:slug/summaries/now', [
    SummariesController,
    'get_latest_of_multiple_sensors',
  ])
  .use(middleware.userAuthentication())

router
  .get('/v1/weather-stations/:slug/sensors/:sensor_slug/summaries', [
    SummariesController,
    'get_one',
  ])
  .use(middleware.userAuthentication())

router
  .get('/v1/weather-stations/:slug/sensors/:sensor_slug/summaries/latest', [
    SummariesController,
    'get_latest_one',
  ])
  .use(middleware.userAuthentication())

router.get('/v1/test', () => {
  return {
    success: true,
  }
})

router
  .get('/v1/auth/test', () => {
    return {
      success: true,
    }
  })
  .use(middleware.userAuthentication())

router.post('/v1/auth/login', [AuthController, 'login'])

router.post('/v1/auth/logout', [AuthController, 'logout']).use(middleware.userAuthentication())

router.post('v1/api/shutdown', [APIController, 'shutdown']).use(
  middleware.userAuthentication({
    min_role: 'admin',
  })
)
