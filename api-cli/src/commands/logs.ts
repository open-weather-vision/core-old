import chalk from "chalk";
import { Command } from "commander";
import prompts from "prompts";
import ora from "ora";
import config from "../util/config.js";
import axios from "axios";
import connection_failed_message from "../util/connection_failed_message.js";
import canceled_message from "../util/canceled_message.js";
import path from "path";
import { exec, spawn } from "child_process";


const logs_command = new Command("logs")
    .description("View output from underlying docker containers - use for debugging")
    .option('-f, --follow', "Follow log output")
    .option('-n, --tail <lines>', `Number of lines to show from the end of the logs (default "all")`, "all")
    .option('--until <time>', "Show logs before a timestamp (e.g. 2013-01-02T13:23:37Z) or relative (e.g. 42m for 42 minutes)")
    .action(async(options) => {
        if(config.get("remote_station")){
            return console.log(chalk.yellow(`⚠️  Cannot get the logs of a remote owvision demon.`));
        }
        const cli_dir = path.resolve(import.meta.dirname + "/../../../api").toString();
        const log_process = exec(`cd "${cli_dir}" && docker compose logs ${options.follow ? `--follow` : ''} --tail ${options.tail} ${options.until ? `--until ${options.until}`: ''}`);
        
        if(!log_process){
            return console.log(chalk.redBright(`Oupps... something went wrong.`));
        }
        log_process.stdout?.pipe(process.stdout);
    });

export default logs_command;