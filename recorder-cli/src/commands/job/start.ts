import { Command } from "commander";
import connection_failed_message from "../../util/connection_failed_message.js";
import axios from "axios";
import error_handling from "../../util/error_handling.js";
import chalk from "chalk";
import ora from "ora";

const start_command = new Command("start")
    .description('start an existing recorder job')
    .argument("<station_slug>", "the station's short name")
    .action(async(station_slug: string) => {
        const spinner = ora("Starting recorder job...").start()
        try{
            const response = await axios({
                url: `http://localhost:3334/v1/jobs/${station_slug}/start`,
                method: "post",
            })

            spinner.stop()
            if(!response.data.success){
                return error_handling(response, {})
            }
            
            console.log(`${chalk.green(`✓ Successfully started recorder job`)}`)
        }catch(err){
            spinner.stop()
            return connection_failed_message();
        }
    })


export default start_command;