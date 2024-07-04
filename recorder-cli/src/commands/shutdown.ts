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
    .description("stop the recorder demon - your data is not lost")
    .action(async() => {
        const response = await prompts([{
            name: "confirm",
            type: "confirm",
            message: chalk.redBright("Do you really want to stop the recorder demon? All your jobs will be stopped!")
        }]);
        if(response.confirm === undefined) return canceled_message();

        if(response.confirm){
            // TODO: Check if api is on remote
            const spinner = ora('Stopping the recorder demon...').start();
            try{
                const cli_dir = path.resolve(import.meta.dirname + "/../../../recorder").toString();
                await exec(`cd "${cli_dir}" && docker compose down`);
                spinner.stop();
                console.log(chalk.magentaBright(`✓ Successfully stopped the recorder demon`));
            }catch(err){
                spinner.stop();
                console.log(chalk.yellow(`⚠️  Failed to stop the recorder demon`));
            }
        }
    });

export default shutdown_command;