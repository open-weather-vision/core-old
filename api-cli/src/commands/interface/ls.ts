import axios from "axios";
import chalk from "chalk";
import { Command } from "commander";
import ora from "ora";
import config from "../../util/config.js";
import error_handling from "../../util/error_handling.js";
import connection_failed_message from "../../util/connection_failed_message.js";

const ls_command = new Command("list")
    .alias('ls')
    .description('List all installed interfaces')
    .action(async () => {
        const spinner = ora('Loading stations...').start();
        try {
            const response = await axios({
                url: `${config.get("api_url")}/interfaces`,
                method: "get",
                headers: {
                    "OWVISION_AUTH_TOKEN": config.get("auth_token")
                },
            });
            spinner.stop()
            if (!response.data.success) {
                return error_handling(response, {})
            }
            const interfaces = response.data.data;
            for (const station_interface of interfaces) {
                console.log(`${chalk.blueBright(station_interface.slug)} ❯ ${chalk.grey(station_interface?.meta_information?.description)}`)
            }
            if(interfaces.length === 0){
                console.log(chalk.grey(chalk.italic(`There are no interfaces installed currently!`)));
            }

        } catch (err) {
            spinner.stop()
            console.error(err);
            connection_failed_message()
        }
    })

export default ls_command