import chalk from "chalk";
import { Command } from "commander";
import config from "../../util/config.js";

const reset_command = new Command("reset")
    .description("Reset the cli's configuration to the default settings")
    .action(() => {
        config.reset();
        console.log(`${chalk.green(`✓ Successfully reset settings`)}`)
    })

export default reset_command