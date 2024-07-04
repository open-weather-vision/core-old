import FailedToStartJobException from '#exceptions/failed_to_start_job_exception';
import WeatherStation from '#models/weather_station'
import axios from 'axios';
import Service from './service.js'

export class LocalJobsService extends Service {

  async ready() {
    const local_stations = await WeatherStation.query().where('remote_recorder', false).exec();

    for(const station of local_stations){
      try{
        await this.create_and_start_local_job(station.slug);
      }catch(err){
        this.logger.error(`Error while starting local recorder for station '${station.slug}': ${err.message}`)
      }
    }
  }

  async create_and_start_local_job(slug: string){
    try{
      const response = await axios({
        url: `http://owvision-local-recorder:3335/v1/jobs/local`,
        method: `post`,
        data: {
          station_slug: slug,
          api_url: `http://owvision-api:3333/v1`,
          username: `recorder`,
          password: `recorder`,
        }
      })

      if(!response.data.success){
        throw new FailedToStartJobException();
      }
      this.logger.info(`Started local recorder for station '${slug}'!`)
    }catch(err){
      throw new FailedToStartJobException();
    }
  } 

  async terminating() {}
}


export default new LocalJobsService();