import { Command } from "commander";
import install_command from "./install.js";
import ls_command from "./ls.js";
import uninstall_command from "./uninstall.js";

const interfaces_command = new Command("interface").description('List, install and uninstall interfaces')

interfaces_command.addCommand(install_command);
interfaces_command.addCommand(ls_command);
interfaces_command.addCommand(uninstall_command);

export default interfaces_command;