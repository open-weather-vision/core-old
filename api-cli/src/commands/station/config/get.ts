import { Command } from "commander";
import chalk from "chalk";
import output_config_value from "../../../util/output_config_value.js";
import connection_failed_message from "../../../util/connection_failed_message.js";
import { station_name_argument } from "../../../arguments_options.js";
import config from "../../../util/config.js";
import axios from "axios";
import ora from "ora";
import error_handling from "../../../util/error_handling.js";
import { InterfaceConfig } from "owvision-environment/interfaces";

const get_command = new Command("get")
    .description("Get a station's configuration")
    .addArgument(station_name_argument)
    .action(async (station_name: string) => {
        const spinner = ora("Getting configuration...").start();
        try {
            const response = await axios({
                url: `${config.get(
                    "api_url"
                )}/weather-stations/${station_name}`,
                method: "get",
                headers: {
                    OWVISION_AUTH_TOKEN: config.get("auth_token"),
                },
            });
            spinner.stop();
            if (!response.data.success) {
                return error_handling(response, { station_slug: station_name });
            }
            const station_config = response.data.data
                .interface_config as InterfaceConfig;
            const keys = Object.keys(station_config ?? {});
            for (const key of keys) {
                const argument = station_config[key];
                output_config_value(key, argument.value);
            }
            if (keys.length === 0) {
                console.log(
                    chalk.gray(
                        chalk.italic("There is no configuration available!")
                    )
                );
            }
        } catch (err) {
            spinner.stop();
            connection_failed_message();
        }
    });

export default get_command;
