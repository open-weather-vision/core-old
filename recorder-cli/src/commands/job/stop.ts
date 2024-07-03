import axios from "axios";
import chalk from "chalk";
import { Command } from "commander";
import connection_failed_message from "../../util/connection_failed_message.js";
import error_handling from "../../util/error_handling.js";

const stop_command = new Command("stop")
    .description('stop an existing recorder job')
    .argument("<station_slug>", "the station's short name")
    .action(async(station_slug: string) => {
        try{
            const response = await axios({
                url: `http://localhost:3334/v1/jobs/${station_slug}/stop`,
                method: "post",
            })

            if(!response.data.success){
                return error_handling(response, {})
            }

            console.log(`${chalk.magenta(`✓ Successfully stopped recorder job`)}`)
        }catch(err){
            return connection_failed_message();
        }
    })


export default stop_command;