import axios from "axios";
import chalk from "chalk";
import { Command } from "commander";
import connection_failed_message from "../../util/connection_failed_message.js";
import error_handling from "../../util/error_handling.js";
import ora from "ora";

const stop_command = new Command("stop")
    .description('stop an existing recorder job')
    .argument("<station_slug>", "the station's short name")
    .action(async(station_slug: string) => {
        const spinner = ora("Stopping recorder job...").start()
        try{
            const response = await axios({
                url: `http://localhost:3334/v1/jobs/${station_slug}/stop`,
                method: "post",
            })

            spinner.stop()
            
            if(!response.data.success){
                return error_handling(response, {})
            }
            console.log(`${chalk.magenta(`✓ Successfully stopped recorder job`)}`)
        }catch(err){
            spinner.stop()
            return connection_failed_message();
        }
    })


export default stop_command;