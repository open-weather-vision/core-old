import { Command, Option } from "commander";
import ls_command from "./ls.js";
import read_command from "./read.js";
import summary_command from "./summary.js";

const sensor_command = new Command('sensor').alias("sn").description("list, configure and read from your station's sensors");

sensor_command.addCommand(ls_command);
sensor_command.addCommand(read_command);
sensor_command.addCommand(summary_command);

export default sensor_command;