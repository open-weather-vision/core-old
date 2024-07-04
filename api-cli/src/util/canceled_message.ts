import chalk from "chalk";

export default function(message?: string){
    console.log(`${chalk.red(`✘ ${message ? message : `Cancelled`}`)}`)
}