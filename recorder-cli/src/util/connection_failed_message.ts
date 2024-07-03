import chalk from "chalk";
import config from "./config.js";

export default function(){
    console.log(`${chalk.red(`✘ Failed to connect to recorder demon. Try running ${chalk.italic("recorder initialize")}.`)}`)
    if(config.get("debug_mode")){
        console.log(chalk.red("✘ demon api url is: http://localhost:3334"))
    }
}