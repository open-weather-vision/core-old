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

const install_command = new Command("install")
    .description("Install a new interface")
    .action(async () => {
        let file: ReadStream | undefined;
        const responses = await prompts({
            name: "file_path",
            type: "text",
            message: "Please enter the interfaces full absolute file path: ",
            validate: (value) => {
                try{
                    const validPath = existsSync(value);
                    if(!validPath) return "Invalid file path entered!";
                    file = createReadStream(value);
                }catch(err){
                    return "Error while creating a read stream to the passed file.";
                }
                return true;
            }
        });
        const slug = path.basename(responses.file_path, '.js');

        const spinner = ora('Installing interface...').start();
        try {
            const response = await axios({
                url: `${config.get("api_url")}/interfaces`,
                method: "post",
                data: {
                    interface: file,
                    slug,
                },
                headers: {
                    "OWVISION_AUTH_TOKEN": config.get("auth_token"),
                    'Content-Type': 'multipart/form-data'
                },
            });
            file?.close()
            spinner.stop()
            if (!response.data.success) {
                return error_handling(response, {})
            }
            console.log(`${chalk.green(`✓ Sucessfully installed interface '${slug}'`)}`);
        } catch (err) {
            spinner.stop()
            connection_failed_message()
        }
    })

export default install_command;