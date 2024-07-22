#!/usr/bin/env node

import axios from "axios";
import { program } from "commander";
import config_command from "./commands/config/index.js";
import station_command from "./commands/station/index.js";
import auth_command from "./commands/auth/index.js";
import initialize_command from "./commands/initialize.js";
import reset_command from "./commands/reset.js";
import pause_command from "./commands/pause.js";
import resume_command from "./commands/resume.js";
import logs_command from "./commands/logs.js";
import interfaces_command from "./commands/interface/index.js";

axios.defaults.validateStatus = () => true;

program.addCommand(initialize_command);
program.addCommand(config_command);
program.addCommand(auth_command);
program.addCommand(station_command);
program.addCommand(reset_command);
program.addCommand(pause_command);
program.addCommand(resume_command);
program.addCommand(logs_command);
program.addCommand(interfaces_command);

program.parse();
