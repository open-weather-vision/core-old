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


const pause_command = new Command("pause")
    .description("Pause the owvision demon - your data is not lost (but cannot be accessed)")
    .action(async() => {
        const response = await prompts([{
            name: "confirm",
            type: "confirm",
            message: chalk.redBright("Do you really want to pause owvision? You data is not lost, but cannot be accessed until 'resume' is called.")
        }]);
        if(response.confirm === undefined) return canceled_message();

        if(response.confirm){
            const spinner = ora('Pausing the owvision demon...').start();
            if(!config.get("remote_station")){
                try{
                    const cli_dir = path.resolve(import.meta.dirname + "/../../../api").toString();
                    await exec(`cd "${cli_dir}" && docker compose stop`);
                    spinner.stop();
                    console.log(chalk.magentaBright(`✓ Successfully paused the owvision demon`));
                }catch(err){
                    spinner.stop();
                    console.log(chalk.yellow(`⚠️  Failed to pause the owvision demon`));
                }
            }else{
                console.log(chalk.yellow(`⚠️  Cannot pause a remote owvision demon. You have to pause it on the host machine.`));
            }
        }
    });

export default pause_command;