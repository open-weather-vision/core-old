#!/usr/bin/env node

import axios, { AxiosResponse } from "axios";
import { Argument, Option, program } from "commander";
import ora from 'ora';
import chalk from 'chalk';
import { DateTime } from "luxon";
import jsonfile from 'jsonfile';
import prompts from "prompts";
import { ElevationUnits, HumidityUnits, PrecipationUnits, PressureUnits, SoilMoistureUnits, SolarRadiationUnits, TemperatureUnits, WindUnits } from "./units.js";
import { title } from "process";
import escape from "js-string-escape";

const config_file_path = "./config.json";

let config: {
    public: {
        api_url: string,
    },
    selected_station: null | string,
} = {
    public: {
        api_url: "http://localhost:3333/v1",
    },
    selected_station: null,
};

try {
    config = jsonfile.readFileSync(config_file_path);
} catch (err) {
    update_config();
}

function update_config() {
    jsonfile.writeFileSync(config_file_path, config);
}

axios.defaults.validateStatus = () => true;

function safe_value_with_unit(value: number | null | string, unit: string | null) {
    if (typeof value === "number") value = value.toFixed(2)
    if (unit === 'none' || value === null) unit = "";
    if (value === null) value = '-';
    return `${value}${unit}`;
}

const config_command = program.command("config").description('configure the cli (e.g. change the api url)')
config_command.command("set <key> <value>").description("configures a parameter").action((key, value) => {
    if (key in config.public) {
        config.public[key as keyof typeof config.public] = value;
        update_config();
        console.log(`${chalk.green(`✔  Successfully set '${key}'`)}`)
    } else {
        console.log(`${chalk.red(`✖ Unknown setting '${key}'`)}`)
    }
})
config_command.command("get <key>").description("gets a parameter's configuration").action((key, value) => {
    if (key in config.public) {
        console.log(`${chalk.magenta(`${key} = ${config.public[key as keyof typeof config.public]}`)}`)
    } else {
        console.log(`${chalk.red(`✖ Unknown setting '${key}'`)}`)
    }
})

const station_command = program.command("station").description('list, configure and communicate with your weather stations')
const station_name_argument = new Argument("[station_name]", "the related weather station's short name").default(config.selected_station)

station_command.command("create").description('create a new weather station').action(async () => {
    const { name } = await prompts({
        message: `please enter the station's ${chalk.italic("name")}: `,
        type: 'text',
        name: 'name',
        validate: (str) => str.length > 1 && str.length <= 50
    });

    const { slug } = await prompts({
        message: `please enter the station's ${chalk.italic("slug")}: `,
        type: 'text',
        name: 'slug',
        validate: (str) => {
            return str.length > 1 && str.length <= 50 && str.match(/^[a-zA-Z-_0-9]*$/);
        }
    });

    const { station_interface } = await prompts({
        message: `please choose the station's ${chalk.italic("interface")}: `,
        type: 'select',
        name: 'station_interface',
        choices: [{
            title: "Davis Vantage Basic",
            description: "An interface to the davis vantage vue, pro and pro 2 with limited functionality",
            value: "davis-vp-old",
        },
        {
            title: "Davis Vantage Advanced",
            description: "An interface to the davis vantage vue and pro 2 with more functionality, only works with a firmware dated after 02.08.2004",
            value: "davis-vp2",
        }]
    });

    const units = await prompts([
        {
            message: `please choose a ${chalk.italic("temperature unit")}: `,
            type: 'select',
            name: 'temperature',
            choices: TemperatureUnits.map((unit) => ({
                title: unit,
                value: unit,
            }))
        },
        {
            message: `please choose a ${chalk.italic("leaf temperature unit")}: `,
            type: 'select',
            name: 'leaf_temperature',
            choices: TemperatureUnits.map((unit) => ({
                title: unit,
                value: unit,
            }))
        },
        {
            message: `please choose a ${chalk.italic("soil temperature unit")}: `,
            type: 'select',
            name: 'soil_temperature',
            choices: TemperatureUnits.map((unit) => ({
                title: unit,
                value: unit,
            }))
        },
        {
            message: `please choose a ${chalk.italic("precipation unit")}: `,
            type: 'select',
            name: 'precipation',
            choices: PrecipationUnits.map((unit) => ({
                title: unit,
                value: unit,
            }))
        },
        {
            message: `please choose a ${chalk.italic("evo transpiration unit")}: `,
            type: 'select',
            name: 'evo_transpiration',
            choices: PrecipationUnits.map((unit) => ({
                title: unit,
                value: unit,
            }))
        },
        {
            message: `please choose a ${chalk.italic("pressure unit")}: `,
            type: 'select',
            name: 'pressure',
            choices: PressureUnits.map((unit) => ({
                title: unit,
                value: unit,
            }))
        },
        {
            message: `please choose an ${chalk.italic("elevation unit")}: `,
            type: 'select',
            name: 'elevation',
            choices: ElevationUnits.map((unit) => ({
                title: unit,
                value: unit,
            }))
        },
        {
            message: `please choose an ${chalk.italic("wind unit")}: `,
            type: 'select',
            name: 'wind',
            choices: WindUnits.map((unit) => ({
                title: unit,
                value: unit,
            }))
        },
        {
            message: `please choose an ${chalk.italic("solar radiation unit")}: `,
            type: 'select',
            name: 'solar_radiation',
            choices: SolarRadiationUnits.map((unit) => ({
                title: unit,
                value: unit,
            }))
        },
        {
            message: `please choose an ${chalk.italic("soil moisture unit")}: `,
            type: 'select',
            name: 'soil_moisture',
            choices: SoilMoistureUnits.map((unit) => ({
                title: unit,
                value: unit,
            }))
        },
        {
            message: `please choose an ${chalk.italic("humidity unit")}: `,
            type: 'select',
            name: 'humidity',
            choices: HumidityUnits.map((unit) => ({
                title: unit,
                value: unit,
            }))
        },
    ]);

    const spinner = ora('Creating new weather station...').start();
    try {
        const response = await axios({
            url: `${config.public.api_url}/weather-stations`,
            method: "post",
            data: {
                name,
                slug,
                interface: station_interface,
                interface_config: {},
                units,
                remote_recorder: false,
            }
        });
        spinner.stop()
        if (response.data.success) {
            console.log(chalk.green(`✔  Created station ${chalk.italic(name)} ${chalk.bold(`(${slug})`)}!`))
        } else {
            throw new Error(response.data.error);
        }
    } catch (err) {
        spinner.stop()
        console.log(`${chalk.red("✖  Failed to connect to owvision api")}`)
    }
});


station_command.command("ls").description('list all weather stations').action(async () => {
    const spinner = ora('Loading stations...').start();
    try {
        const response = await axios({
            url: `${config.public.api_url}/weather-stations`,
            method: "get",
        });
        spinner.stop()
        if (response.data.success) {
            const stations = response.data.data;
            for (const station of stations) {
                const active = station.state === "active";
                console.log(`${chalk.blue(station.name)} ${chalk.bold(`(${station.slug})`)} ❯ [${active ? chalk.green(station.state) : chalk.red(station.state)}]`)
            }
        } else {
            throw new Error(response.data.error);
        }
    } catch (err) {
        spinner.stop()
        console.log(`${chalk.red("✖  Failed to connect to owvision api")}`)
    }
})

station_command.command("select <station_name>").description("select a station for all following commands").action(async (station_name) => {
    const spinner = ora('Validating station name...').start();
    try {
        const response = await axios({
            url: `${config.public.api_url}/weather-stations`,
            method: "get",
        });
        spinner.stop()
        if (response.data.success) {
            const station_slugs = response.data.data.map((station: any) => station.slug);
            if (!station_slugs.includes(station_name)) {
                console.log(`${chalk.red("✖  Cannot select an unknown station")}`)
            } else {
                console.log(`${chalk.green(`✔  Selected station '${station_name}'`)}`)
                config.selected_station = station_name
                update_config();
            }
        } else {
            throw new Error(response.data.error);
        }
    } catch (err) {
        console.log(`${chalk.red("✖  Failed to connect to owvision api")}`)
    }
});

station_command.command("selected").description("prints out the selected weather station").action((station_name) => {
    console.log(chalk.bold(config.selected_station))
});


station_command.command("up").addArgument(station_name_argument).description('start the recorder of a weather station').action(async (station_name) => {
    const spinner = ora('Starting station...').start();
    try {
        const response = await axios({
            url: `${config.public.api_url}/weather-stations/${station_name}/up`,
            method: "post",
        });
        spinner.stop()
        if (response.data.success) {
            console.log(`${chalk.green(`✔  Station ${chalk.bold(station_name)} is active`)}`)
        } else {
            throw new Error(response.data.error);
        }
    } catch (err) {
        spinner.stop()
        console.log(`${chalk.red("✖  Failed to connect to owvision api")}`)
    }
});

station_command.command("down").addArgument(station_name_argument).description('stop the recorder of a weather station').action(async (station_name) => {
    const spinner = ora('Stopping station...').start();
    try {
        const response = await axios({
            url: `${config.public.api_url}/weather-stations/${station_name}/down`,
            method: "post",
        });
        spinner.stop()
        if (response.data.success) {
            console.log(`${chalk.magenta(`✔  Station ${chalk.bold(station_name)} is inactive`)}`)
        } else {
            throw new Error(response.data.error);
        }
    } catch (err) {
        spinner.stop()
        console.log(`${chalk.red("✖  Failed to connect to owvision api")}`)
    }
});

// command: owvision sensors <station-name> [-o sensor_name]
const sensors_command = station_command.command('sensors').description("list, configure and read from your station's sensors");
const sensors_only_option = new Option("-o, --only [sensor_names...]", "execute the command only on the passed sensors")

sensors_command.command("ls").addArgument(station_name_argument).description('list all sensors of a weather station').action(async (station_name) => {
    const spinner = ora('Loading sensors...').start();
    try {
        const sensors_response = await axios({
            url: `${config.public.api_url}/weather-stations/${station_name}/sensors`,
            method: "get",
        });
        if (!sensors_response.data.success) {
            throw new Error(sensors_response.data.error);
        }
        const sensors = sensors_response.data.data;

        spinner.stop()
        for (const sensor of sensors) {
            console.log(`${chalk.blue(sensor.name)} ${chalk.bold(`(${sensor.slug})`)} ❯ gets updated every ${sensor.interval} ${sensor.interval_unit}s`)
        }
    } catch (err) {
        spinner.stop()
        console.log(`${chalk.red("✖  Failed to connect to owvision api")}`)
    }
}
);


sensors_command.command("read").addArgument(station_name_argument).description('retrieve the latest measured values from all or only the specified sensors of a weather station').addOption(sensors_only_option).action(async (station_name, options) => {
    const sensor_names = options.only;
    const spinner = ora('Loading sensors data...').start();
    try {
        const sensors_response = await axios({
            url: `${config.public.api_url}/weather-stations/${station_name}/sensors`,
            method: "get",
        });
        if (!sensors_response.data.success) {
            throw new Error(sensors_response.data.error);
        }
        const sensors = sensors_response.data.data;

        const records: any = {};

        for (const sensor of sensors) {
            if (sensor_names?.length > 0 && !sensor_names.includes(sensor.slug)) continue;
            try {
                const sensor_data = await axios({
                    url: `${config.public.api_url}/weather-stations/${station_name}/sensors/${sensor.slug}/now`,
                    method: "get",
                });

                if (!sensor_data.data.success) {
                    throw new Error(sensor_data.data.error);
                }
                records[sensor.slug] = sensor_data.data.data;
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
            console.log(`${chalk.blue(sensor.name)} ${chalk.bold(`(${sensor.slug})`)} ❯ ${safe_value_with_unit(record.value, record.unit)} ${seconds_ago !== null ? chalk.gray(`(${-seconds_ago}s ago)`) : ''}`)
        }
    } catch (err) {
        spinner.stop()
        console.log(`${chalk.red("✖  Failed to connect to owvision api")}`)
    }
})

// command: owvision summary <station-name> [-o sensor_name]
sensors_command.command("summary")
    .addArgument(station_name_argument)
    .description('get a summary of all sensors (max value measured, min value measured, etc)')
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
        let url = `${config.public.api_url}/weather-stations/${station_name}/summaries`
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
            });
            spinner.stop()
            if (response.data.success) {
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

            } else {
                if (response.data.error.code === "E_NOTFOUND") {
                    console.log(`${chalk.red("✖  Found no summary for the specified interval")}`)
                } else if (response.data.error.code === "validation-error" || response.data.error.code === "E_VALIDATION_ERROR") {
                    console.log(`${chalk.red(`✖  Invalid option argument for '--${type}' has been passed`)}`)
                }
                else {
                    throw new Error(response.data.error);
                }
            }
        } catch (err) {
            spinner.stop()
            console.log(`${chalk.red("✖  Failed to connect to owvision api")}`)
        }
    })


program.parse();