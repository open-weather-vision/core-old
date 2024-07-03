import chalk from "chalk";
import { Command } from "commander";
import rainbow from "../util/rainbow.js";
import sleep from "../util/sleep.js";
import prompts from "prompts";
import canceled_message from "../util/canceled_message.js";
import ora, { Ora } from "ora";
import exec from "await-exec";
import config from "../util/config.js";
import axios from "axios";
import connection_failed_message from "../util/connection_failed_message.js";
import path from "path";


const initialize_command = new Command("initialize").alias("init")
    .description("initializes owvision - start with this command if you are new")
    .action(async() => {

        console.log(chalk.green(`◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼`));
        console.log(chalk.green(`◼                  Welcome to ${rainbow("owvision")}                 ◼`));
        console.log(chalk.green(`◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼`));
        console.log(chalk.gray(`A tool designed for managing any kind of weather station!`));
        console.log(chalk.gray(`─────────────────────────────────────────────────────────`));
        console.log(chalk.gray(`To get started we need to set some things up!`));
        console.log(chalk.gray(`─────────────────────────────────────────────────────────`));
        const { is_remote_api } = await prompts([
            {
                message: "Is the owvision demon already running on another machine?",
                type: "toggle",
                inactive: chalk.red('no'),
                active: chalk.green('yes'),
                name: "is_remote_api"
            }
        ]);
        if(is_remote_api === undefined) return canceled_message();

        let api_url_plain = "http://localhost:3333";
        let spinner: Ora;
        if(is_remote_api){
            const api_host_response = await prompts([
                {
                    message: `Where is the owvision demon running? `,
                    type: "text",
                    name: "api_url_plain",
                    validate: (val) => {
                        const valid = val.match(/^((https?:)(\/\/\/?)([\w]*(?::[\w]*)?@)?([\d\w\.-]+)(?::(\d+))?)?$/) && val.length > 0;
                        if(valid) return true;
                        else return "Invalid url entered, valid examples: http://localhost:3000, https://192.168.92.1:90"
                    }
                }
            ]);
            if(api_host_response.api_url_plain === undefined) return canceled_message();

            api_url_plain = api_host_response.api_url_plain;
            spinner = ora("Connecting to remote demon...").start()
            try{
                const response = await axios({
                    url: `${api_url_plain}/v1/test`,
                    method: "get",
                });
                spinner.stop()
                console.log(chalk.green(`✓ Connection test succeeded`));
            }catch(err){
                spinner.stop()
                return console.log(chalk.red(`✘ Connection test failed, is your demon running?`));
            }
        }else{
            spinner = ora("Starting api...").start()
            
            const cli_dir = path.resolve(import.meta.dirname + "/../../").toString();
            try{
                await exec(`cd "${cli_dir}" && docker compose up -d --quiet-pull`);
            }catch(err){
                spinner.stop();
                return console.log(chalk.red(`✘ Failed to initialize owvision (failed to start owvision demon)`));
            }
        }
        config.set("api_url", api_url_plain + "/v1");
        config.set("remote_station", is_remote_api)
        config.save()
        spinner.stop();
        console.log(chalk.green(`✓ Successfully initialized owvision`));
    });

export default initialize_command;