import { Logger } from '@adonisjs/core/logger'

export default class Service {
  protected logger!: Logger

  async loggerInit() {
    this.logger = (await import('@adonisjs/core/services/logger')).default // workaround to use logger
  }

  async ready() {}

  async terminating() {}
}
