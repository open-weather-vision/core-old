#!/usr/bin/env node

import axios from "axios";
import { program } from "commander";
import config_command from "./commands/config/index.js";
import station_command from "./commands/station/index.js";
import auth_command from "./commands/auth/index.js";
import initialize_command from "./commands/initialize.js";
import shutdown_command from "./commands/shutdown.js";


axios.defaults.validateStatus = () => true;

program.addCommand(initialize_command);
program.addCommand(config_command);
program.addCommand(auth_command);
program.addCommand(station_command);
program.addCommand(shutdown_command);

program.parse();