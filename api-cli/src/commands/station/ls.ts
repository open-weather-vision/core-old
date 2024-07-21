import axios from "axios";
import chalk from "chalk";
import { Command } from "commander";
import ora from "ora";
import config from "../../util/config.js";
import error_handling from "../../util/error_handling.js";
import connection_failed_message from "../../util/connection_failed_message.js";

const ls_command = new Command("list")
    .alias('ls')
    .description('List all weather stations')
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
                const selected = config.get("selected_station") === station.slug;
                console.log(`${station.remote_recorder ? `${chalk.bgMagenta.white(`remote`)} ` : ''}${chalk.blueBright(selected ? chalk.underline(station.name) : station.name)} ${chalk.bold(`(${station.slug})`)} ❯ [${active ? chalk.green(station.state) : chalk.redBright(station.state)}]`)
            }
            if(stations.length === 0){
                console.log(chalk.grey(chalk.italic(`There are no weather stations configured currently!`)));
            }

        } catch (err) {
            spinner.stop()
            connection_failed_message()
        }
    })

export default ls_command