import chalk from "chalk";
import { Command } from "commander";
import rainbow from "../util/rainbow.js";
import sleep from "../util/sleep.js";
import prompts from "prompts";
import canceled_message from "../util/cancelled_message.js";
import ora, { Ora } from "ora";
import exec from "await-exec";
import config from "../util/config.js";
import axios from "axios";
import connection_failed_message from "../util/connection_failed_message.js";
import path from "path";
import error_handling from "../util/error_handling.js";


const initialize_command = new Command("initialize").alias("init")
    .description("Intialize owvision - start with this command if you are new")
    .action(async () => {

        console.log(chalk.green(`◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼`));
        console.log(chalk.green(`◼                  Welcome to ${rainbow("owvision")}                 ◼`));
        console.log(chalk.green(`◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼`));
        console.log(chalk.gray(`A tool designed for managing any kind of weather station!`));
        console.log(chalk.gray(`─────────────────────────────────────────────────────────`));
        console.log(chalk.gray(`To get started we need to set some things up!`));
        console.log(chalk.gray(`─────────────────────────────────────────────────────────`));
        const { is_remote_api } = await prompts([
            {
                message: `Is owvision running on another host? `,
                type: 'select',
                name: 'is_remote_api',
                choices: [
                    {
                        title: "no",
                        description: `${chalk.italic(`Recommended.`)} Run the owvision demon on the current host.`,
                        value: false,
                        selected: true,
                    },
                    {
                        title: "yes",
                        description: `${chalk.italic(`For advanced setups.`)} Your owvision demon is running on another host.`,
                        value: true,
                    }]
            }
        ]);
        if (is_remote_api === undefined) return canceled_message();

        let api_url_plain = "http://localhost:3333";
        let spinner: Ora;
        if (is_remote_api) {
            const api_host_response = await prompts([
                {
                    message: `Where is the owvision demon running? `,
                    type: "text",
                    name: "api_url_plain",
                    validate: (val) => {
                        const valid = val.match(/^((https?:)(\/\/\/?)([\w]*(?::[\w]*)?@)?([\d\w\.-]+)(?::(\d+))?)?$/) && val.length > 0;
                        if (valid) return true;
                        else return "Invalid url entered, valid examples: http://localhost:3000, https://192.168.92.1:90"
                    }
                }
            ]);
            if (api_host_response.api_url_plain === undefined) return canceled_message();

            api_url_plain = api_host_response.api_url_plain;
            spinner = ora("Connecting to remote demon...").start()
            try {
                const response = await axios({
                    url: `${api_url_plain}/v1/test`,
                    method: "get",
                });
                spinner.stop()
                console.log(chalk.green(`✓ Connection test succeeded`));
            } catch (err) {
                spinner.stop()
                return console.log(chalk.redBright(`✘ Connection test failed, is your demon running?`));
            }
        } else {
            spinner = ora("Starting api...").start()

            const cli_dir = path.resolve(import.meta.dirname + "/../../../api").toString();
            try {
                await exec(`cd "${cli_dir}" && docker compose up -d --quiet-pull`);
            } catch (err) {
                spinner.stop();
                return console.log(chalk.redBright(`✘ Failed to initialize owvision (failed to start owvision demon)`));
            }
        }
        config.set("api_url", api_url_plain + "/v1");
        config.set("remote_station", is_remote_api)
        config.save()
        await sleep(4000);
        spinner.stop();
        console.log(chalk.green(`✓ Successfully initialized owvision`));

        const responses = await prompts([
            {
                name: "username",
                type: "text",
                message: "please enter your username: "
            },
            {
                name: "password",
                type: "password",
                message: "please enter your password: "
            }
        ])
        if (responses.password === undefined) return canceled_message("Cancelled authentification");

        const auth_spinner = ora('Logging in...').start();
        try {
            const response = await axios({
                url: `${config.get("api_url")}/auth/login`,
                data: {
                    username: responses.username,
                    password: responses.password,
                },
                headers: {
                    "Content-Type": "application/json"
                },
                method: "post"
            })

            if (!response.data.success) {
                auth_spinner.stop();
                return error_handling(response, {});
            }

            config.set("auth_token", response.data.data.auth_token)
            config.save()

            auth_spinner.stop();
            console.log(`${chalk.green(`✓ Successfully logged in`)}`)
        } catch (err) {
            auth_spinner.stop();
            connection_failed_message();
        }
    });

export default initialize_command;