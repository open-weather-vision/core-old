import { Command } from "commander";
import get_command from "./get.js";

const config_command = new Command("config").description(
    "configure an existing weather station"
);

config_command.addCommand(get_command);

export default config_command;
