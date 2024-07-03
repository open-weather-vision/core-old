import { Command } from "commander";
import config from "../../util/config.js";
import chalk from "chalk";

const set_command = new Command("set")
    .argument("<key>")
    .argument("<value>")
    .description("configures a parameter")
    .action((key, value) => {
        const success = config.set(key, value);
        if (success) {
            config.update();
            console.log(`${chalk.green(`✔  Successfully set '${key}'`)}`)
        } else {
            console.log(`${chalk.red(`✖ Unknown setting '${key}'`)}`)
        }
    })

export default set_command;