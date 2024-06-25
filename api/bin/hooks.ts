import recorder_service from '#services/recorder_service'
import summary_creator_service from '#services/summary_creator_service'

/**
 * This function is executed after the api has been booted
 */
export async function ready() {
  await summary_creator_service.loggerInit()
  await summary_creator_service.ready()
  await recorder_service.loggerInit()
  await recorder_service.ready()
}

/**
 * This function is executed before the api terminates
 */
export async function terminating() {
  await summary_creator_service.terminating()
  await recorder_service.terminating()
}
