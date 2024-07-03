import chalk from "chalk"

export default function(key: string, value: any){
    if(value === null){
        console.log(`${chalk.magentaBright(`${key} is ${chalk.italic("null")}`)}`)
    }else{
        console.log(`${chalk.magentaBright(`${key} = ${value}`)}`)
    }
}