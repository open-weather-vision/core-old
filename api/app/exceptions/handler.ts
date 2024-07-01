import app from '@adonisjs/core/services/app'
import { HttpContext, ExceptionHandler } from '@adonisjs/core/http'
import { Exception } from '@adonisjs/core/exceptions'
import { errors } from '@vinejs/vine'

export default class HttpExceptionHandler extends ExceptionHandler {
  /**
   * In debug mode, the exception handler will display verbose errors
   * with pretty printed stack traces.
   */
  protected debug = !app.inProduction

  /**
   * The method is used for handling errors and returning
   * response to the client
   */
  async handle(error: any, ctx: HttpContext) {
    if (error instanceof Exception) {
      ctx.response.status(error.status).json({
        success: false,
        error: {
          message: error.message,
          code: error.code,
          stack: error.stack,
        },
      })
    } else if (error instanceof errors.E_VALIDATION_ERROR) {
      ctx.response.status(400).json({
        success: false,
        error: {
          message: error.messages[0].message,
          code: error.code,
          stack: error?.stack,
        },
      })
    } else {
      ctx.response.status(500).json({
        success: false,
        error: {
          message: error?.message || 'Unknown error!',
          code: error?.code || 'unknown',
          stack: error?.stack,
        },
      })
    }
    // return super.handle(error, ctx)
  }

  /**
   * The method is used to report error to the logging service or
   * the third party error monitoring service.
   *
   * @note You should not attempt to send a response from this method.
   */
  async report(error: unknown, ctx: HttpContext) {
    return super.report(error, ctx)
  }
}
