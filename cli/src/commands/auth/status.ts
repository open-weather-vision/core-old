import chalk from "chalk";
import { Command } from "commander";
import config from "../../util/config.js";

const status_command = new Command("status")
    .description("check if you are currently logged in")
    .action(async () => {
        if (config.get("auth_token") !== null) {
            console.log(`${chalk.green(`✔  You are logged in`)}`)
        } else {
            console.log(`${chalk.red(`✖  You are not logged in`)}`)
        }
    })

export default status_command