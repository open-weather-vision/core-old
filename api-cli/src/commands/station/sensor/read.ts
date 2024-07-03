import axios from "axios";
import chalk from "chalk";
import { Command } from "commander";
import { DateTime } from "luxon";
import ora from "ora";
import safe_value_with_unit from "../../../util/safe_value_with_unit.js";
import config from "../../../util/config.js";
import { sensors_only_option, station_name_argument } from "../../../arguments_options.js";
import error_handling from "../../../util/error_handling.js";
import connection_failed_message from "../../../util/connection_failed_message.js";

const read_command = new Command("read")
    .alias("rd")
    .description('retrieve the latest measured values from all or only the specified sensors of a weather station')
    .addArgument(station_name_argument)
    .addOption(sensors_only_option)
    .action(async (station_name, options) => {
        const sensor_names = options.only;
        const spinner = ora('Loading sensors data...').start();
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

            const records: any = {};

            for (const sensor of sensors) {
                if (sensor_names?.length > 0 && !sensor_names.includes(sensor.slug)) continue;
                try {
                    const sensor_data_response = await axios({
                        url: `${config.get("api_url")}/weather-stations/${station_name}/sensors/${sensor.slug}/now`,
                        method: "get",
                        headers: {
                            "OWVISION_AUTH_TOKEN": config.get("auth_token")
                        },
                    });

                    if (!sensor_data_response.data.success) {
                        spinner.stop()
                        return error_handling(sensor_data_response, {station_slug: station_name, sensor_slug: sensor.slug})
                    }
                    records[sensor.slug] = sensor_data_response.data.data;
                } catch (err) {
                    records[sensor.slug] = { value: null, unit: 'none' };
                }
            }
            spinner.stop()
            for (const sensor of sensors) {
                if (sensor_names?.length > 0 && !sensor_names.includes(sensor.slug)) continue;
                const record = records[sensor.slug];
                if (record.unit === "none") record.unit = "";
                if (typeof record.value === "number") record.value = record.value.toFixed(2);
                const seconds_ago = record.created_at !== null ? DateTime.fromISO(record.created_at).diffNow("seconds").seconds.toFixed(0) : null
                console.log(`${chalk.blueBright(sensor.name)} ${chalk.bold(`(${sensor.slug})`)} ❯ ${safe_value_with_unit(record.value, record.unit)} ${seconds_ago !== null ? chalk.gray(`(${-seconds_ago}s ago)`) : ''}`)
            }
        } catch (err) {
            spinner.stop()
            connection_failed_message()
        }
    })

export default read_command