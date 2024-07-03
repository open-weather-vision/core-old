import chalk from "chalk";
import config from "./config.js";

export default function(){
    console.log(`${chalk.red(`✘ Failed to connect to owvision demon. Try running ${chalk.italic("owvision initialize")}.`)}`)
    if(config.get("debug_mode")){
        console.log(chalk.red("✘ owvision demon url is: " + config.get("api_url")))
    }
}