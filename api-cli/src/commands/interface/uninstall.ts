import { Argument, Command } from "commander";
import chalk from "chalk";
import ora from "ora";
import axios from "axios";
import config from "../../util/config.js";
import error_handling from "../../util/error_handling.js";
import connection_failed_message from "../../util/connection_failed_message.js";

const uninstall_command = new Command("uninstall")
    .description("Uninstall an interface")
    .addArgument(new Argument("<slug>", "The interface's slug"))
    .action(async (interface_slug) => {
        const spinner = ora('Uninstalling interface...').start();
        try {
            const response = await axios({
                url: `${config.get("api_url")}/interfaces/${interface_slug}`,
                method: "delete",
                headers: {
                    "OWVISION_AUTH_TOKEN": config.get("auth_token"),
                },
            });
            spinner.stop()
            if (!response.data.success) {
                return error_handling(response, { station_interface_slug: interface_slug })
            }
            console.log(`${chalk.green(`✓ Sucessfully uninstalled interface '${interface_slug}'`)}`);
        } catch (err) {
            spinner.stop()
            connection_failed_message()
        }
    })

export default uninstall_command;