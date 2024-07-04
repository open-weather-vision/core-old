import Service from './service.js'
import { Recorder } from '../other/recorder.js'
import RecorderJob from '#models/recorder_job';

class RecorderService extends Service {
  private recorder_jobs: {
    [T in string]: Recorder
  } = {}

  async ready() {
    this.logger.info(`Starting recorder service`)
    const recorder_jobs = await RecorderJob.query().where('state', 'active').exec()
    for (const job of recorder_jobs) {
      try{
        await this.start_recorder_job(job)
      }catch(err){
        this.logger.error(err.message);
      }
    }
  }

  /**
   * Starts a recorder for the passed weather station. The weather station must have configured a valid interface.
   * @param job
   */
  async start_recorder_job(job: RecorderJob) {
    this.recorder_jobs[job.station_slug] = await Recorder.create(job, this.logger)
    this.recorder_jobs[job.station_slug].start()
    this.logger.info(`Started recorder job for station '${job.station_slug}'`)
  }

  /**
   * Stops the recorder for the passed weather station. The weather station must have configured a valid interface.
   * @param station
   */
  async stop_recorder_job(slug: string) {
    await this.recorder_jobs[slug].stop()
    delete this.recorder_jobs[slug]
    this.logger.info(`Removed recorder job for station '${slug}'`)
  }

  async terminating() {
    for (const slug in this.recorder_jobs) {
      this.stop_recorder_job(slug)
    }
    this.logger.info(`Stopped recorder service`)
  }
}

export default new RecorderService()
