import { program, Argument, Command } from "commander";
import config from "../../util/config.js";
import create_command from "./create.js";
import ls_command from "./ls.js";
import select_command from "./select.js";
import selected_command from "./selected.js";
import down_command from "./down.js";
import up_command from "./up.js";
import sensors_command from "./sensors/index.js";

const station_command = new Command("station").description('list, configure and communicate with your weather stations')

station_command.addCommand(create_command);
station_command.addCommand(ls_command);
station_command.addCommand(select_command);
station_command.addCommand(selected_command);
station_command.addCommand(up_command);
station_command.addCommand(down_command);
station_command.addCommand(sensors_command);

export default station_command;