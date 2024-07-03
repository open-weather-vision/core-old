import chalk from "chalk";
import { Command } from "commander";
import rainbow from "../util/rainbow.js";
import sleep from "../util/sleep.js";
import prompts from "prompts";
import canceled_message from "../util/canceled_message.js";
import ora from "ora";
import { execSync } from "child_process";

const initialize_command = new Command("initialize")
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
                message: "Is your api running on another machine?",
                type: "toggle",
                inactive: chalk.red('no'),
                active: chalk.green('yes'),
                name: "is_remote_api"
            }
        ]);

        let api_url_plain = "http://localhost:3333";
        if(is_remote_api === undefined) return canceled_message();
        if(is_remote_api){
            const api_host_response = await prompts([
                {
                    message: `Where is the api running? `,
                    type: "text",
                    name: "api_url_plain",
                    validate: (val) => {
                        const valid = val.match(/^((https?:)(\/\/\/?)([\w]*(?::[\w]*)?@)?([\d\w\.-]+)(?::(\d+))?)?$/) && val.length > 0;
                        if(valid) return true;
                        else return "Invalid url entered, valid examples: http://localhost:3000, https://192.168.92.1:90"
                    }
                }
            ]);
            if(api_host_response === undefined) return canceled_message();
            api_url_plain = api_host_response.api_url_plain;
        }else{
            const spinner = ora('Starting api...').start();
            execSync("docker compose up -d --quiet");
            spinner.stop();
            console.log(chalk.green(`Successfully started api as docker container!`));
        }

    });

export default initialize_command;