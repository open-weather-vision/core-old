#!/usr/bin/env node

import axios from "axios";
import { program } from "commander";
import config_command from "./commands/config/index.js";
import job_command from "./commands/job/index.js";
import init_command from "./commands/initialize.js";
import shutdown_command from "./commands/shutdown.js";


axios.defaults.validateStatus = () => true;

program.addCommand(init_command)
program.addCommand(config_command);
program.addCommand(job_command);
program.addCommand(shutdown_command);

program.parse();