import chalk from "chalk";
import { Command } from "commander";
import config from "../../util/config.js";
import axios from "axios";
import error_handling from "../../util/error_handling.js";
import connection_failed_message from "../../util/connection_failed_message.js";
import ora from "ora";

const status_command = new Command("status")
    .description("check if you are currently logged in")
    .action(async () => {
        const spinner = ora('Checking connection...').start();
        if (config.get("auth_token") !== null) {
            try{
                const response = await axios({
                    url: `${config.get("api_url")}/auth/test`,
                    headers: {
                        "OWVISION_AUTH_TOKEN": config.get("auth_token")
                    },
                    method: "get"
                })
                if(!response.data.success){
                    spinner.stop();
                    if(response.data.error.code === "E_AUTH"){
                        return console.log(`${chalk.red(`✘ You are not logged in`)}`)
                    }
                    else return error_handling(response, {});
                }
            }catch(err){
                spinner.stop();
                return connection_failed_message();
            }
            
            spinner.stop();
            console.log(`${chalk.green(`✓ You are logged in`)}`)
        } else {
            spinner.stop();
            console.log(`${chalk.red(`✘ You are not logged in`)}`)
        }
    })

export default status_command