import { AxiosResponse } from "axios"
import chalk from "chalk"
import config from "./config.js"

export default function(response: AxiosResponse, params: {
    station_slug?: string,
    sensor_slug?: string
}){
    if (response.data.error.code === "E_AUTH") {
        console.log(chalk.red(`✘ ${response.data.error.message}`))
    }else if(response.data.error.code === "E_VALIDATION_ERROR"){
        console.log(chalk.red(`✘ Validation error: ${response.data.error.message}`))
    }else if (response.data.error.code === "E_LOGIN") {
        console.log(chalk.red(`✘ Failed to login: invalid username and password combination!`))
    }else if (params.station_slug !== undefined && response.data.error.code === "E_STATION_NOT_FOUND") {
        if(params.station_slug !== null){
            console.log(chalk.red(`✘ Unknown station '${params.station_slug}'`))
        }else{
            console.log(chalk.red(`✘ You didn't select any station!`))
        }
    }else if (params.sensor_slug !== undefined && response.data.error.code === "E_SENSOR_NOT_FOUND") {
        console.log(chalk.red(`✘ Unknown sensor '${params.sensor_slug}'`))
    }else if (response.data.error.code === "E_SUMMARY_NOT_FOUND") {
        console.log(chalk.red(`✘ There is no summary in the specified interval!`))
    }else{
        console.log(chalk.red(`✘ An unknown error occurred (code: ${response.data.error.code})`))
        if(config.get("debug_mode")) console.error(response.data.error);
    }
}