import axios from "axios";
import chalk from "chalk";
import { Command } from "commander";
import ora from "ora";
import config from "../../util/config.js";
import { station_name_argument } from "../../arguments_options.js";
import error_handling from "../../util/error_handling.js";
import connection_failed_message from "../../util/connection_failed_message.js";

const up_command = new Command("up")
    .addArgument(station_name_argument)
    .description('start the recorder of a weather station')
    .action(async (station_name) => {
        const spinner = ora('Starting station...').start();
        try {
            const response = await axios({
                url: `${config.get("api_url")}/weather-stations/${station_name}/up`,
                method: "post",
                headers: {
                    "OWVISION_AUTH_TOKEN": config.get("auth_token")
                },
            });
            spinner.stop()
            if (!response.data.success) {
                return error_handling(response, {station_slug: station_name})
            }
            console.log(`${chalk.green(`✔  Station ${chalk.bold(station_name)} is active`)}`)
        } catch (err) {
            spinner.stop()
            connection_failed_message()
        }
    });

export default up_command;