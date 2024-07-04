import chalk from "chalk"
import { Command } from "commander"
import config from "../../util/config.js"
import prompts from "prompts"
import canceled_message from "../../util/canceled_message.js"

const change_username_command = new Command("change-username")
    .description("change the authenticated user's name")
    .action(async () => {
        if(!config.get("auth_token")){
            return console.log(`${chalk.red("✘ You are currently not logged in")}`)
        }

        let username_new = "";
        const responses = await prompts([
            {
                name: "current_password",
                type: "password",
                message: "please enter your current password: "
            },
            {
                name: "username",
                type: "text",
                message: "please enter your new username: ",
                validate: (val) => {
                    const valid = val.length > 1 && val.length <= 50 && val.match(/^[a-z-_0-9]*$/);
                    username_new = val;
                    if(valid) return true;
                    else return "Invalid username entered, valid examples: joe_and_bob02, luisa-sidney33";
                }
            },
            {
                name: "username_new",
                type: "text",
                message: "please confirm your new username: ",
                
                validate: (value) => {
                    if(value === username_new) return true;
                    else return "usernames do not match"
                }
            }
        ])
        if(responses.username_new === undefined){
            canceled_message();
        }else{
            console.log(`${chalk.magentaBright(`✓ Successfully changed the authenticated user's name`)}`)
        }
    })

export default change_username_command