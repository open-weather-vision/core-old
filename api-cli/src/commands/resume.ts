import chalk from "chalk";
import { Command } from "commander";
import ora from "ora";
import exec from "await-exec";
import config from "../util/config.js";
import path from "path";

const resume_command = new Command("resume")
    .description("Resume the owvision demon")
    .action(async () => {
        const spinner = ora("Resuming the owvision demon...").start();
        if (!config.get("remote_station")) {
            try {
                const cli_dir = path
                    .resolve(import.meta.dirname + "/../../../api")
                    .toString();
                await exec(`cd "${cli_dir}" && docker compose start`);
                spinner.stop();
                console.log(
                    chalk.magentaBright(
                        `✓ Successfully resumed the owvision demon`
                    )
                );
            } catch (err) {
                spinner.stop();
                console.log(
                    chalk.yellow(`⚠️  Failed to resume the owvision demon`)
                );
            }
        } else {
            console.log(
                chalk.yellow(
                    `⚠️  Cannot resume a remote owvision demon. You have to resume it on the host machine.`
                )
            );
        }
    });

export default resume_command;
