import { Command } from "commander"
import config from "../../util/config.js"
import chalk from "chalk";
import output_config_value from "../../util/output_config_value.js";

const get_command = new Command("get")
    .argument("[key]")
    .description("Get a parameter's configuration, if no argument is passed the whole configuration is returned")
    .action((key) => {
        if(key){
            const value = config.get(key);
            if (value !== undefined) {
                output_config_value(key, value);
            } else {
                console.log(`${chalk.redBright(`✘Unknown setting '${key}'`)}`)
            }
        }else{
            const modifiable_config = config.modifiable_config;
            for(const key in modifiable_config){
                const value = modifiable_config[key as keyof typeof modifiable_config];
                output_config_value(key, value);
            }
        }
    })

export default get_command;