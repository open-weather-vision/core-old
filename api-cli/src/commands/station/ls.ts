import axios from "axios";
import chalk from "chalk";
import { Command } from "commander";
import ora from "ora";
import config from "../../util/config.js";
import error_handling from "../../util/error_handling.js";
import connection_failed_message from "../../util/connection_failed_message.js";

const ls_command = new Command("ls")
    .description('list all weather stations')
    .action(async () => {
        const spinner = ora('Loading stations...').start();
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
                return error_handling(response, {})
            }
            const stations = response.data.data;
            for (const station of stations) {
                const active = station.state === "active";
                console.log(`${chalk.blueBright(station.name)} ${chalk.bold(`(${station.slug})`)} ❯ [${active ? chalk.green(station.state) : chalk.red(station.state)}]`)
            }

        } catch (err) {
            spinner.stop()
            connection_failed_message()
        }
    })

export default ls_command