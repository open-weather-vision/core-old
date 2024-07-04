import chalk from "chalk";
import { Command } from "commander";
import config from "../../util/config.js";

const selected_command = new Command("selected")
    .description("Print out the selected weather station")
    .action((station_name) => {
        console.log(chalk.bold(config.get("selected_station")))
    });

export default selected_command;