import { Command } from "commander";
import create_command from "./create.js";
import start_command from "./start.js";
import stop_command from "./stop.js";
import ls_command from "./ls.js";

const job_command = new Command("job").description('configure, start and stop recorder jobs')

job_command.addCommand(create_command)
job_command.addCommand(start_command)
job_command.addCommand(stop_command)
job_command.addCommand(ls_command)

export default job_command;