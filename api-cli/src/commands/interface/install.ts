import { Command } from "commander";
import chalk from "chalk";
import ora from "ora";
import axios from "axios";
import config from "../../util/config.js";
import error_handling from "../../util/error_handling.js";
import connection_failed_message from "../../util/connection_failed_message.js";
import prompts from "prompts";
import { createReadStream, ReadStream, existsSync } from "fs";
import path from "path";
import vine from "@vinejs/vine";
import canceled_message from "../../util/cancelled_message.js";

const url_validator = vine.compile(vine.string().url());

const install_command = new Command("install")
    .description("Install a new interface")
    .action(async () => {
        let file: ReadStream | undefined;
        const responses = await prompts({
            name: "repository_url",
            type: "text",
            message: "Please enter the interface's repository url: ",
            validate: async (value) => {
                const [error] = await url_validator.tryValidate(value);

                if(error) return error.messages[0];
                else return true;
            }
        });
        if(!responses.repository_url){
            return canceled_message();
        }

        const spinner = ora('Installing interface...').start();
        try {
            const response = await axios({
                url: `${config.get("api_url")}/interfaces`,
                method: "post",
                data: {
                    repository_url: responses.repository_url,
                },
                headers: {
                    "OWVISION_AUTH_TOKEN": config.get("auth_token"),
                    'Content-Type': 'multipart/form-data'
                },
                timeout: 80 * 1000
            });
            file?.close()
            spinner.stop()
            if (!response.data.success) {
                return error_handling(response, { station_interface_url: responses.repository_url})
            }
            console.log(`${chalk.green(`✓ Sucessfully installed interface ${chalk.italic(response.data.data.meta_information.name)} (${response.data.data.slug})`)}`);
        } catch (err) {
            spinner.stop()
            connection_failed_message()
        }
    })

export default install_command;