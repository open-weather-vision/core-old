import chalk from "chalk";
import config from "./config.js";

export default function () {
    console.log(
        `${chalk.redBright(
            `✘ Failed to connect to recorder demon. Try running ${chalk.italic(
                "recorder initialize"
            )}.`
        )}`
    );
    if (config.get("debug_mode")) {
        console.log(
            chalk.redBright("✘ owvision demon url is: http://localhost:3334")
        );
    }
}
