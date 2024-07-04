import { Command } from "commander";
import connection_failed_message from "../../util/connection_failed_message.js";
import axios from "axios";
import error_handling from "../../util/error_handling.js";
import chalk from "chalk";
import ora from "ora";

const ls_command = new Command("ls")
    .description('list all registered recorder jobs')
    .action(async(station_slug: string) => {
        const spinner = ora("Getting all recorder jobs...").start()
        try{
            const response = await axios({
                url: `http://localhost:3334/v1/jobs/`,
                method: "get",
            })

            spinner.start()
            if(!response.data.success){
                return error_handling(response, {})
            }

            const jobs = response.data.data;
            for (const job of jobs) {
                const active = job.state === "active";
                console.log(`${chalk.blueBright(job.station_slug)} ${chalk.italic(`(${job.api_url})`)} ❯ [${active ? chalk.green(job.state) : chalk.redBright(job.state)}]`)
            }
        }catch(err){
            spinner.stop()
            return connection_failed_message();
        }
    })


export default ls_command;