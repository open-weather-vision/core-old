import { Command } from "commander";
import set_command from "./set.js";
import get_command from "./get.js";
import reset_command from "./reset.js";

const config_command = new Command("config").description('configure the cli (e.g. change the api url)')

config_command.addCommand(get_command);
config_command.addCommand(set_command);
config_command.addCommand(reset_command);

export default config_command;