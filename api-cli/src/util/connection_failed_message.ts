import chalk from "chalk";
import config from "./config.js";

export default function(){
    console.log(`${chalk.redBright(`✘ Failed to connect to owvision demon. Try running ${chalk.italic(`owvision init`)} or ${chalk.italic(`owvision resume`)}.`)}`)
    if(config.get("debug_mode")){
        console.log(chalk.redBright("✘ owvision demon url is: " + config.get("api_url")))
    }
}