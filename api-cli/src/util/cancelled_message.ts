import chalk from "chalk";

export default function(message?: string){
    console.log(`${chalk.redBright(`✘ ${message ? message : `Cancelled`}`)}`)
}