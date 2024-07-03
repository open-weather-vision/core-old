import { Command } from "commander";
import connection_failed_message from "../../util/connection_failed_message.js";
import prompts from "prompts";
import axios from "axios";
import canceled_message from "../../util/canceled_message.js";
import error_handling from "../../util/error_handling.js";
import chalk from "chalk";
import { password } from "promptly";

const create_command = new Command("create")
    .description('create a new recorder job')
    .action(async() => {
        const responses = await prompts([
            {
                name: 'station_slug',
                message: "What's the station's name? ",
                type: 'text',
            },
            {
                name: 'api_url',
                message: 'Where is the api running? ',
                type: 'text',
                validate: (val) => {
                    const valid = val.match(/^((https?:)(\/\/\/?)([\w]*(?::[\w]*)?@)?([\d\w\.-]+)(?::(\d+))?)?$/) && val.length > 0;
                    if(valid) return true;
                    else return "Invalid url entered, valid examples: http://localhost:3000, https://192.168.92.1:90"
                }
            },
            {
                name: 'username',
                message: "What's the recorder's username? ",
                type: 'text',
            },
            {
                name: 'password',
                message: "What's the recorder's password? ",
                type: 'password',
            }
        ]);
        if(responses.password === undefined) return canceled_message();

        try{
            responses.api_url += "/v1"
            const response = await axios({
                url: `http://localhost:3334/v1/jobs`,
                method: "post",
                data: responses
            })

            if(!response.data.success){
                return error_handling(response, { station_slug: responses.station_slug })
            }

            console.log(`${chalk.green(`✓ Successfully created job for station '${responses.station_slug}'`)}`)
        }catch(err){
            return connection_failed_message();
        }
    })


export default create_command;