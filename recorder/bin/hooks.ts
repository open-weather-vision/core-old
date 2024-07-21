import interface_service from "#services/interface_service"
import recorder_service from "#services/recorder_service"


/**
 * This function is executed after the api has been booted
 */
export async function ready() {
  await interface_service.ready()
  await recorder_service.ready()
}

/**
 * This function is executed before the api terminates
 */
export async function terminating() {
  await recorder_service.terminating()
  await interface_service.terminating()
}
