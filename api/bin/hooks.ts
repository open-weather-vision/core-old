import local_jobs_service from '../app/managers/local_jobs_service.js'
import summary_creator_service from '../app/managers/summary_creator_service.js'

/**
 * This function is executed after the api has been booted
 */
export async function ready() {
  await summary_creator_service.loggerInit()
  await summary_creator_service.ready()
  await local_jobs_service.loggerInit()
  await local_jobs_service.ready()
}

/**
 * This function is executed before the api terminates
 */
export async function terminating() {
  await summary_creator_service.terminating()
  await local_jobs_service.terminating()
}
