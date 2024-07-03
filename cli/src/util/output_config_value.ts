import chalk from "chalk"

export default function(key: string, value: string | null){
    if(value === null){
        console.log(`${chalk.magenta(`${key} is ${chalk.italic("null")}`)}`)
    }else{
        console.log(`${chalk.magenta(`${key} = ${value}`)}`)
    }
}