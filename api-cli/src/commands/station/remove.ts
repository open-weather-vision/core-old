import axios from "axios";
import chalk from "chalk";
import { Command } from "commander";
import ora from "ora";
import prompts from "prompts";
import { TemperatureUnits, PrecipationUnits, PressureUnits, ElevationUnits, WindUnits, SolarRadiationUnits, SoilMoistureUnits, HumidityUnits } from "../../units.js";
import config from "../../util/config.js";
import canceled_message from "../../util/canceled_message.js";
import error_handling from "../../util/error_handling.js";
import connection_failed_message from "../../util/connection_failed_message.js";
import { station_name_argument } from "../../arguments_options.js";

const remove_command = new Command("remove")
    .alias("rm")
    .addArgument(station_name_argument)
    .description('Remove an existing weather station and all of its data')
    .action(async (station_name) => {
        const response = await prompts([{
            name: "confirm",
            type: "confirm",
            message: chalk.redBright(`Do you really want to remove the station '${station_name}'? This action is irreversible.`)
        }]);
        if(response.confirm === undefined || !response.confirm) return canceled_message();

        const spinner = ora('Removing station...').start();
        try {
            const response = await axios({
                url: `${config.get("api_url")}/weather-stations/${station_name}`,
                method: "delete",
                headers: {
                    "OWVISION_AUTH_TOKEN": config.get("auth_token")
                },
            });
            spinner.stop()
            if (!response.data.success) {
                return error_handling(response, {station_slug: station_name})
            }
            console.log(`${chalk.green(`✓ Station ${chalk.bold(station_name)} has been removed`)}`)
        } catch (err) {
            spinner.stop()
            connection_failed_message()
        }
    });

export default remove_command;