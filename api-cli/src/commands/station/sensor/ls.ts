import axios from "axios";
import chalk from "chalk";
import { Command } from "commander";
import ora from "ora";
import config from "../../../util/config.js";
import { station_name_argument } from "../../../arguments_options.js";
import error_handling from "../../../util/error_handling.js";
import connection_failed_message from "../../../util/connection_failed_message.js";

const ls_command = new Command("list")
    .alias("ls")
    .description('List all sensors of a weather station')
    .addArgument(station_name_argument)
    .action(async (station_name) => {
        const spinner = ora('Loading sensors...').start();
        try {
            const sensors_response = await axios({
                url: `${config.get("api_url")}/weather-stations/${station_name}/sensors`,
                method: "get",
                headers: {
                    "OWVISION_AUTH_TOKEN": config.get("auth_token")
                },
            });
            if (!sensors_response.data.success) {
                spinner.stop()
                return error_handling(sensors_response, {station_slug: station_name})
            }
            const sensors = sensors_response.data.data;

            spinner.stop()
            for (const sensor of sensors) {
                console.log(`${chalk.blueBright(sensor.name)} ${chalk.bold(`(${sensor.slug})`)} ❯ gets updated every ${sensor.interval} ${sensor.interval_unit}s`)
            }
        } catch (err) {
            spinner.stop()
            connection_failed_message()
        }
    }
    );

export default ls_command;