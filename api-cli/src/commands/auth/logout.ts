import chalk from "chalk"
import { Command } from "commander"
import config from "../../util/config.js"
import axios from "axios";
import ora from "ora";
import connection_failed_message from "../../util/connection_failed_message.js";
import error_handling from "../../util/error_handling.js";

const logout_command = new Command("logout")
    .description("Log the current user out")
    .action(async () => {
        if (config.get("auth_token") === null) {
            return console.log(`${chalk.magentaBright(`✓ You are already logged out`)}`)
        }
        const spinner = ora('Logging out...').start();
        try{
            const response = await axios({
                url: `${config.get("api_url")}/auth/logout`,
                headers: {
                    "OWVISION_AUTH_TOKEN": config.get("auth_token")
                },
                method: "post"
            })

            if(!response.data.success && response.data?.error?.code !== "E_AUTH"){
                spinner.stop();
                return error_handling(response, {});
            }

            
            config.set("auth_token", null);
            config.save();
            spinner.stop();
            console.log(`${chalk.magentaBright(`✓ Successfully logged out`)}`)
        }catch(err){
            spinner.stop();
            connection_failed_message();
        }
    })

export default logout_command