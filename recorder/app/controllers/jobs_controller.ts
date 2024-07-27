// import type { HttpContext } from '@adonisjs/core/http'

import JobNotFoundException from '#exceptions/job_not_found_exception'
import RecorderJob from '#models/recorder_job'
import recorder_service from '#services/recorder_service'
import { job_validator } from '#validators/job'
import { HttpContext } from '@adonisjs/core/http'

export default class JobsController {
  async get_all_jobs() {
    const jobs = await RecorderJob.query().exec()

    return {
      success: true,
      data: jobs,
    }
  }

  async create_and_start_job(ctx: HttpContext) {
    const payload = await job_validator.validate(ctx.request.body())

    let job = await RecorderJob.query().where('station_slug', payload.station_slug).first()

    if (!job) {
      job = await RecorderJob.create({
        ...payload,
        state: 'active',
      })
    } else {
      job.state = 'active'
      job.api_url = payload.api_url
      job.password = payload.password
      job.username = payload.username
      await job.save()
    }

    await recorder_service.start_recorder_job(job)

    return {
      success: true,
    }
  }

  async create_job(ctx: HttpContext) {
    const payload = await job_validator.validate(ctx.request.body())

    const existing_job = await RecorderJob.query()
      .where('station_slug', payload.station_slug)
      .first()

    if (!existing_job) {
      await RecorderJob.create({
        ...payload,
        state: 'inactive',
      })
    } else {
      existing_job.api_url = payload.api_url
      existing_job.password = payload.password
      existing_job.username = payload.username
      await existing_job.save()
    }

    return {
      success: true,
    }
  }

  async start_job(ctx: HttpContext) {
    const station_slug = ctx.params.station_slug

    const job = await RecorderJob.query().where('station_slug', station_slug).first()

    if (!job) {
      throw new JobNotFoundException(station_slug)
    }

    if (job.state === 'inactive') {
      await recorder_service.start_recorder_job(job)

      job.state = 'active'
      await job.save()
    }

    return {
      success: true,
    }
  }

  async stop_job(ctx: HttpContext) {
    const station_slug = ctx.params.station_slug

    const job = await RecorderJob.query().where('station_slug', station_slug).first()

    if (!job) throw new JobNotFoundException(station_slug)

    await recorder_service.stop_recorder_job(station_slug)
    job.state = 'inactive'
    await job.save()

    return {
      success: true,
    }
  }

  async delete_job(ctx: HttpContext) {
    const station_slug = ctx.params.station_slug

    await recorder_service.delete_job(station_slug)

    return {
      success: true,
    }
  }
}
