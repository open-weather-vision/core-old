/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import JobsController from '#controllers/jobs_controller'
import router from '@adonisjs/core/services/router'

router.get('/v1/jobs', [JobsController, 'get_all_jobs'])
router.post('/v1/jobs', [JobsController, 'create_job'])
router.post('/v1/jobs/:station_slug/start', [JobsController, 'start_job'])
router.post('/v1/jobs/:station_slug/stop', [JobsController, 'stop_job'])
router.delete('/v1/jobs/:station_slug', [JobsController, 'delete_job'])
