import axios from "axios";
import chalk from "chalk";
import { Command, Option } from "commander";
import { DateTime } from "luxon";
import ora from "ora";
import safe_value_with_unit from "../../../util/safe_value_with_unit.js";
import config from "../../../util/config.js";
import { sensors_only_option, station_name_argument } from "../../../arguments_options.js";
import error_handling from "../../../util/error_handling.js";
import connection_failed_message from "../../../util/connection_failed_message.js";

const summary_command = new Command("summary")
    .description('get a summary of all sensors (max value measured, min value measured, etc)')
    .addArgument(station_name_argument)
    .addOption(sensors_only_option)
    .addOption(new Option("-h, --hour [hour in dd.mm.yyyy:HH]", "get the summary of the passed hour, if no hour is passed the current one is taken"))
    .addOption(new Option("-d, --day [date in dd.mm.yyyy]", "get the summary of the passed date, if no date is passed the current one is taken"))
    .addOption(new Option("-w, --week [week in yyyy:week]", "get the summary of the passed week, if no week is passed the current one is taken"))
    .addOption(new Option("-m, --month [month in mm.yyyy]", "get the summary of the passed month, if no month is passed the current one is taken"))
    .addOption(new Option("-y, --year [year in yyyy]", "get the summary of the passed year, if no year is passed the current one is taken"))
    .addOption(new Option("-a, --alltime", "get the alltime summary (default)"))
    .action(async (station_name, options) => {
        const spinner = ora('Loading summary...').start();
        const sensor_names = options.only;
        const type = options.alltime ? "alltime" : options.year ? "year" : options.month ? "month" : options.week ? "week" : options.day ? "day" : options.hour ? "hour" : "alltime";
        let hour = DateTime.now().hour, day = DateTime.now().day, week = DateTime.now().weekNumber, month = DateTime.now().month, year = DateTime.now().year;
        let url = `${config.get("api_url")}/weather-stations/${station_name}/summaries`
        if (typeof options[type] === "string") {
            try {
                switch (type) {
                    case "hour":
                        const split_string_hour = options.hour.split(":");
                        const date_split_hour = split_string_hour[0].split(".");
                        hour = split_string_hour[1];
                        day = date_split_hour[0];
                        month = date_split_hour[1];
                        year = date_split_hour[2];
                        url += `?hour=${hour}&day=${day}&month=${month}&year=${year}`
                        break;
                    case "day":
                        const split_string_day = options.day.split(".");
                        day = split_string_day[0];
                        month = split_string_day[1];
                        year = split_string_day[2];
                        url += `?day=${day}&month=${month}&year=${year}`
                        break;
                    case "week":
                        const split_string_week = options.week.split(":");
                        week = split_string_week[1];
                        year = split_string_week[0];
                        url += `?week=${week}&year=${year}`
                        break;
                    case "month":
                        const split_string_month = options.month.split(".");
                        month = split_string_month[0];
                        year = split_string_month[1];
                        url += `?month=${month}&year=${year}`
                        break;
                    case "year":
                        url += `?year=${options.year}`
                        break;
                }
            } catch (err) {
                console.log(`${chalk.red(`✖  Invalid option argument for option '--${type}' has been passed`)}`)
                return;
            }
        } else {
            url += `/now?type=${type}`;
        }

        try {
            const response = await axios({
                url,
                method: "get",
                headers: {
                    "OWVISION_AUTH_TOKEN": config.get("auth_token")
                },
            });
            spinner.stop()
            if (!response.data.success) { 
                return error_handling(response, {station_slug: station_name})
            }

            const summary = response.data.data;
            for (const record of summary.records) {
                if (sensor_names?.length > 0 && !sensor_names.includes(record.sensor_slug)) continue;
                let record_string = "";
                switch (record.summary_type) {
                    case "max":
                        record_string = `\t❯ ${chalk.magenta('max:')} ${safe_value_with_unit(record.max_value, record.unit)} at ${record.max_time ? chalk.italic(DateTime.fromISO(record.max_time).toFormat("dd.MM.yyyy (HH:mm)")) : '-'}`
                        break;
                    case "min":
                        record_string = `\t❯ ${chalk.magenta('min:')} ${safe_value_with_unit(record.min_value, record.unit)} at ${record.min_time ? chalk.italic(DateTime.fromISO(record.min_time).toFormat("dd.MM.yyyy (HH:mm)")) : '-'}`
                        break;
                    case "min-max":
                        record_string = `\t❯ ${chalk.magenta('min:')} ${safe_value_with_unit(record.min_value, record.unit)} at ${record.min_time ? chalk.italic(DateTime.fromISO(record.min_time).toFormat("dd.MM.yyyy (HH:mm)")) : '-'}\n`
                        record_string += `\t❯ ${chalk.magenta('max:')} ${safe_value_with_unit(record.max_value, record.unit)} at ${record.max_time ? chalk.italic(DateTime.fromISO(record.max_time).toFormat("dd.MM.yyyy (HH:mm)")) : '-'}`
                        break;
                    case "min-avg":
                        record_string = `\t❯ ${chalk.magenta('min:')} ${safe_value_with_unit(record.min_value, record.unit)} at ${record.min_time ? chalk.italic(DateTime.fromISO(record.min_time).toFormat("dd.MM.yyyy (HH:mm)")) : '-'} \n`
                        record_string += `\t❯ ${chalk.magenta('avg:')} ${safe_value_with_unit(record.avg_value, record.unit)}`
                        break;
                    case "max-avg":
                        record_string = `\t❯ ${chalk.magenta('max:')} ${safe_value_with_unit(record.max_value, record.unit)} at ${record.max_time ? chalk.italic(DateTime.fromISO(record.max_time).toFormat("dd.MM.yyyy (HH:mm)")) : '-'}\n`
                        record_string += `\t❯ ${chalk.magenta('avg:')} ${safe_value_with_unit(record.avg_value, record.unit)}`
                        break;
                    case "min-max-avg":
                        record_string = `\t❯ ${chalk.magenta('min:')} ${safe_value_with_unit(record.min_value, record.unit)} at ${record.min_time ? chalk.italic(DateTime.fromISO(record.min_time).toFormat("dd.MM.yyyy (HH:mm)")) : '-'}\n`
                        record_string += `\t❯ ${chalk.magenta('max:')} ${safe_value_with_unit(record.max_value, record.unit)} at ${record.max_time ? chalk.italic(DateTime.fromISO(record.max_time).toFormat("dd.MM.yyyy (HH:mm)")) : '-'}\n`
                        record_string += `\t❯ ${chalk.magenta('avg:')} ${safe_value_with_unit(record.avg_value, record.unit)}`
                        break;
                    case "avg":
                        record_string = `\t❯ ${chalk.magenta('avg:')} ${safe_value_with_unit(record.avg_value, record.unit)}`
                        break;
                    case "latest":
                        record_string = `\t❯ ${chalk.magenta('latest:')} ${safe_value_with_unit(record.value, record.unit)} at ${record.time ? chalk.italic(DateTime.fromISO(record.time).toFormat("dd.MM.yyyy (HH:mm)")) : '-'}`
                        break;
                    case "oldest":
                        record_string = `\t❯ ${chalk.magenta('oldest:')} ${safe_value_with_unit(record.value, record.unit)} at ${record.time ? chalk.italic(DateTime.fromISO(record.time).toFormat("dd.MM.yyyy (HH:mm)")) : '-'}`
                        break;
                    case "sum":
                        record_string = `\t❯ ${chalk.magenta('sum:')} ${safe_value_with_unit(record.value, record.unit)}`
                        break;
                    case "custom":
                        record_string = `\t❯ ${safe_value_with_unit(record.value, record.unit)}`
                        break;
                }
                console.log(`${chalk.blue(record.sensor_name)} ${chalk.bold(`(${record.sensor_slug})`)}`)
                console.log(record_string)
            }
        } catch (err) {
            spinner.stop()
            connection_failed_message()
        }
    })

export default summary_command;