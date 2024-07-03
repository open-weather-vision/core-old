import chalk from "chalk"
import { Command } from "commander"
import config from "../../util/config.js"
import prompts from "prompts"
import canceled_message from "../../util/canceled_message.js"

const change_password_command = new Command("change-password")
    .description("change the authenticated user's password")
    .action(async () => {
        if(!config.get("auth_token")){
            return console.log(`${chalk.red("✘ You are currently not logged in")}`)
        }

        let password_new = "";
        const responses = await prompts([
            {
                name: "current_password",
                type: "password",
                message: "please enter your current password: "
            },
            {
                name: "password_new",
                type: "password",
                message: "please enter your new password: ",
                validate: (val) => {
                    password_new = val;
                    return true;
                }
            },
            {
                name: "password_new_2",
                type: "password",
                message: "please confirm your new password: ",
                
                validate: (value) => {
                    if(value === password_new) return true;
                    else return "passwords do not match"
                }
            }
        ])
        if(Object.keys(responses).length === 0){
            canceled_message();
        }else{
            console.log(`${chalk.magentaBright(`✓ Successfully changed the authenticated user's password`)}`)
        }
    })

export default change_password_command