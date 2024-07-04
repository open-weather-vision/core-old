import chalk from "chalk";
import { Command } from "commander";
import prompts from "prompts";
import ora from "ora";
import exec from "await-exec";
import config from "../util/config.js";
import axios from "axios";
import connection_failed_message from "../util/connection_failed_message.js";
import canceled_message from "../util/canceled_message.js";
import path from "path";


const shutdown_command = new Command("shutdown")
    .description("stops the owvision api - your data is not lost")
    .action(async() => {
        const response = await prompts([{
            name: "confirm",
            type: "confirm",
            message: chalk.red("Do you really want to stop the owvision api?")
        }]);
        if(response.confirm === undefined) return canceled_message();

        if(response.confirm){
            // TODO: Check if api is on remote
            const spinner = ora('Stopping the api...').start();
            if(!config.get("remote_station")){
                try{
                    const cli_dir = path.resolve(import.meta.dirname + "/../../../api").toString();
                    await exec(`cd "${cli_dir}" && docker compose down`);
                    spinner.stop();
                    console.log(chalk.magentaBright(`✓ Successfully stopped the api`));
                }catch(err){
                    spinner.stop();
                    console.log(chalk.yellow(`⚠️  Failed to stop the api`));
                }
            }else{
                try{
                    const response = await axios({
                        url: `${config.get("api_url")}/api/shutdown`,
                        method: 'post',
                        headers: {
                            "OWVISION_AUTH_TOKEN": config.get("auth_token")
                        },
                    })
                    spinner.stop();
                    console.log(chalk.magentaBright(`✓ Successfully stopped the api`));
                }catch(err){
                    spinner.stop();
                    return connection_failed_message();
                }
            }
        }
    });

export default shutdown_command;