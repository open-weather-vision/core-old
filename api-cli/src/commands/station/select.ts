import axios from "axios";
import chalk from "chalk";
import { Command } from "commander";
import ora from "ora";
import config from "../../util/config.js";
import error_handling from "../../util/error_handling.js";
import connection_failed_message from "../../util/connection_failed_message.js";

const select_command = new Command("select")
    .argument("<station_name>")
    .description("Select a station for all following commands")
    .action(async (station_name) => {
        const spinner = ora('Validating station name...').start();
        try {
            const response = await axios({
                url: `${config.get("api_url")}/weather-stations`,
                method: "get",
                headers: {
                    "OWVISION_AUTH_TOKEN": config.get("auth_token")
                },
            });
            spinner.stop()
            if (!response.data.success) {
                return error_handling(response, { station_slug: station_name })
            }
            const station_slugs = response.data.data.map((station: any) => station.slug);
            if (!station_slugs.includes(station_name)) {
                console.log(`${chalk.redBright("✘ Cannot select an unknown station")}`)
            } else {
                console.log(`${chalk.green(`✓ Selected station '${station_name}'`)}`)
                config.set_not_modifiable("selected_station", station_name)
                config.save()
            }
        } catch (err) {
            connection_failed_message()
        }
    });

export default select_command;