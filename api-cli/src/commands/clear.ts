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


const clear_command = new Command("clear")
    .description("Stop the owvision demon and remove all your data")
    .action(async() => {
        const response = await prompts([{
            name: "confirm",
            type: "confirm",
            message: chalk.redBright("Do you really want to clear owvision? All your data is lost!")
        }]);
        if(response.confirm === undefined) return canceled_message();

        if(response.confirm){
            const spinner = ora('Stopping the api...').start();
            if(!config.get("remote_station")){
                try{
                    const cli_dir = path.resolve(import.meta.dirname + "/../../../api").toString();
                    await exec(`cd "${cli_dir}" && docker compose down`);
                    spinner.stop();
                    console.log(chalk.magentaBright(`✓ Successfully stopped the owvision demon and removed all your data.`));
                }catch(err){
                    spinner.stop();
                    console.log(chalk.yellow(`⚠️  Failed to stop the owvision demon`));
                }
            }else{
                console.log(chalk.yellow(`⚠️  Cannot stop a remote owvision demon. You have to stop it on the host machine.`));
            }
        }
    });

export default clear_command;