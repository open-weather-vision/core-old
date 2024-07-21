import chalk from "chalk";
import { Command } from "commander";
import prompts from "prompts";
import config from "../../util/config.js";
import axios from "axios";
import error_handling from "../../util/error_handling.js";
import connection_failed_message from "../../util/connection_failed_message.js";
import ora from "ora";
import canceled_message from "../../util/cancelled_message.js";

const login_command = new Command("login")
    .description("Login, neccessary before any communication with your weather stations")
    .action(async () => {
        const responses = await prompts([
            {
                name: "username",
                type: "text",
                message: "please enter your username: "
            },
            {
                name: "password",
                type: "password",
                message: "please enter your password: "
            }
        ])
        if(responses.password === undefined) return canceled_message();

        const spinner = ora('Logging in...').start();
        try{
            const response = await axios({
                url: `${config.get("api_url")}/auth/login`,
                data: {
                    username: responses.username,
                    password: responses.password,  
                },
                headers: {
                    "Content-Type": "application/json"
                },
                method: "post"
            })

            if(!response.data.success){
                spinner.stop();
                return error_handling(response, {});
            }

            config.set("auth_token", response.data.data.auth_token)
            config.save()
            
            spinner.stop();
            console.log(`${chalk.green(`✓ Successfully logged in`)}`)
        }catch(err){
            spinner.stop();
            connection_failed_message();
        }

       
    })

export default login_command