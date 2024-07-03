import { Command, Option } from "commander";
import ls_command from "./ls.js";
import read_command from "./read.js";
import summary_command from "./summary.js";

const sensors_command = new Command('sensors').description("list, configure and read from your station's sensors");

sensors_command.addCommand(ls_command);
sensors_command.addCommand(read_command);
sensors_command.addCommand(summary_command);

export default sensors_command;