import { AxiosResponse } from "axios"
import chalk from "chalk"
import config from "./config.js"

export default function(response: AxiosResponse, params: {
    station_slug?: string,
    sensor_slug?: string,
    station_interface_slug?: string
}){
    if (response.data.error.code === "E_AUTH") {
        console.log(chalk.redBright(`✘ ${response.data.error.message}`))
    }else if(response.data.error.code === "E_VALIDATION_ERROR"){
        console.log(chalk.redBright(`✘ Validation error: ${response.data.error.message}`))
    }else if (response.data.error.code === "E_LOGIN") {
        console.log(chalk.redBright(`✘ Failed to login: invalid username and password combination!`))
    }else if (params.station_slug !== undefined && response.data.error.code === "E_STATION_NOT_FOUND") {
        if(params.station_slug !== null){
            console.log(chalk.redBright(`✘ Unknown station '${params.station_slug}'`))
        }else{
            console.log(chalk.redBright(`✘ You didn't select any station!`))
        }
    }else if (params.sensor_slug !== undefined && response.data.error.code === "E_SENSOR_NOT_FOUND") {
        console.log(chalk.redBright(`✘ Unknown sensor '${params.sensor_slug}'`))
    }else if (params.station_interface_slug !== undefined && response.data.error.code === "E_INTERFACE_NOT_FOUND") {
        console.log(chalk.redBright(`✘ Unknown station interface '${params.station_interface_slug}'`))
    }else if (response.data.error.code === "E_SUMMARY_NOT_FOUND") {
        console.log(chalk.redBright(`✘ There is no summary in the specified interval!`))
    }else{
        console.log(chalk.redBright(`✘ An unknown error occurred (code: ${response.data.error.code})`))
        if(config.get("debug_mode")) console.error(response.data.error);
    }
}