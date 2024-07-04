import { AxiosResponse } from "axios"
import chalk from "chalk"
import config from "./config.js"

export default function(response: AxiosResponse, params: {
    station_slug?: string,
}){
    if (response.data.error.code === "E_JOB_NOT_FOUND") {
        console.log(chalk.redBright(`✘ There is no recorder for station '${params.station_slug}'`))
    }else if (response.data.error.code === "E_FAILED_TO_START_JOB") {
        console.log(chalk.redBright(`✘ ${response.data.error.message}`))
    }else{
        console.log(chalk.redBright(`✘ An unknown error occurred (code: ${response.data.error.code})`))
        if(config.get("debug_mode")) console.error(response.data.error);
    }
}