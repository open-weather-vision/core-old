import { Command } from "commander";
import chalk from "chalk";
import rainbow from "../util/rainbow.js";
import exec from "await-exec";
import path from "path";
import ora from "ora";

const init_command = new Command("initialize").alias("init")
    .description('initialize the recorder cli - run this command if you are new')
    .action(async () => {
        console.log(chalk.green(`◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼`));
        console.log(chalk.green(`◼           Welcome to the ${rainbow("owvision recorder")}           ◼`));
        console.log(chalk.green(`◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼`));
        console.log(chalk.gray(`A tool to send weather data to the owvision demon!`));
        console.log(chalk.gray(`─────────────────────────────────────────────────────────`));
        console.log(chalk.gray(`To get started we need to set some things up!`));
        console.log(chalk.gray(`─────────────────────────────────────────────────────────`));

        const spinner = ora("Starting the recorder demon...").start()
        const cli_dir = path.resolve(import.meta.dirname + "/../../").toString();
        try{
            await exec(`cd "${cli_dir}" && docker compose up -d --quiet-pull`);  spinner.stop();
            console.log(chalk.green(`✓ Successfully initialized the owvision recorder`));
        } catch (err) {
            spinner.stop();
            return console.log(chalk.red(`✘ Failed to initialize the owvision recorder (failed to start the recorder demon)`));
        }
    })


export default init_command;