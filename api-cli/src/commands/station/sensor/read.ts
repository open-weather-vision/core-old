import axios from "axios";
import chalk from "chalk";
import { Command, Option } from "commander";
import { DateTime } from "luxon";
import ora from "ora";
import safe_value_with_unit from "../../../util/safe_value_with_unit.js";
import config from "../../../util/config.js";
import {
    sensors_only_option,
    station_name_argument,
} from "../../../arguments_options.js";
import error_handling from "../../../util/error_handling.js";
import connection_failed_message from "../../../util/connection_failed_message.js";
import Table from "cli-table3";
import { createLogUpdate } from "log-update";
import { stdout } from "process";

const overwrite = createLogUpdate(stdout);

const read_command = new Command("read")
    .alias("rd")
    .description(
        "Get the latest measured values from all or only the specified sensors of a weather station"
    )
    .addArgument(station_name_argument)
    .addOption(sensors_only_option)
    .addOption(new Option("-a, --all", "Also show disconnected sensors"))
    .action(async (station_name, options) => {
        const sensor_names = options.only;
        const show_disconnected = options.all;

        // Get sensor list
        let sensors = await get_sensor_list(station_name);
        if (!sensors) return;
        sensors = sensors.filter((sensor) =>
            sensor_names?.length > 0 ? sensor_names.includes(sensor.slug) : true
        );

        const render_table = async (show_spinner: boolean) => {
            const table = new Table({
                head: ["sensor", "value", "latest update"],
                colWidths: [30, 20, 20],
            });
            const records = await read_sensors(
                sensors,
                station_name,
                show_spinner
            );
            if (!records) return;

            let lines = 3;
            for (const sensor of sensors) {
                if (lines + 2 > stdout.rows) break;
                const record = records[sensor.slug];
                if (record.value === null && !show_disconnected) continue;
                if (record.unit === "none") record.unit = "";
                if (typeof record.value === "number")
                    record.value = record.value.toFixed(1);
                const seconds_ago =
                    record.created_at !== null
                        ? DateTime.fromISO(record.created_at)
                              .diffNow("seconds")
                              .seconds.toFixed(0)
                        : null;
                table.push([
                    sensor.name,
                    chalk.bold(safe_value_with_unit(record.value, record.unit)),
                    seconds_ago !== null
                        ? chalk.gray(`${-seconds_ago}s ago`)
                        : "-",
                ]);
                lines += 2;
            }
            overwrite(table.toString());
        };
        render_table(true);
        setInterval(() => {
            render_table(false);
        }, 1000);
    });

export default read_command;

async function get_sensor_list(station_name: string): Promise<any[] | false> {
    const spinner = ora("Loading sensors...").start();
    try {
        const sensors_response = await axios({
            url: `${config.get(
                "api_url"
            )}/weather-stations/${station_name}/sensors`,
            method: "get",
            headers: {
                OWVISION_AUTH_TOKEN: config.get("auth_token"),
            },
        });
        if (!sensors_response.data.success) {
            spinner.stop();
            error_handling(sensors_response, {
                station_slug: station_name,
            });
            return false;
        }
        spinner.stop();
        return sensors_response.data.data;
    } catch (err) {
        spinner.stop();
        connection_failed_message();
        return false;
    }
}

async function read_sensors(
    sensors: any[],
    station_name: string,
    show_spinner: boolean
): Promise<any | false> {
    const spinner = ora("Reading from sensors...");
    if (show_spinner) spinner.start();
    const records: any = {};
    for (const sensor of sensors) {
        try {
            const sensor_data_response = await axios({
                url: `${config.get(
                    "api_url"
                )}/weather-stations/${station_name}/sensors/${sensor.slug}/now`,
                method: "get",
                headers: {
                    OWVISION_AUTH_TOKEN: config.get("auth_token"),
                },
            });

            if (!sensor_data_response.data.success) {
                if (show_spinner) spinner.stop();
                error_handling(sensor_data_response, {
                    station_slug: station_name,
                    sensor_slug: sensor.slug,
                });
                return false;
            }
            records[sensor.slug] = sensor_data_response.data.data;
        } catch (err) {
            if (show_spinner) spinner.stop();
            connection_failed_message();
            return false;
        }
    }
    if (show_spinner) spinner.stop();
    return records;
}
