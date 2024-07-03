import { Command } from "commander";
import login_command from "./login.js";
import logout_command from "./logout.js";
import change_password_command from "./change-password.js";
import change_username_command from "./change-username.js";
import status_command from "./status.js";

const auth_command = new Command("auth").description("login to your owvision account, change your password, ...");

auth_command.addCommand(login_command);
auth_command.addCommand(logout_command);
auth_command.addCommand(change_password_command);
auth_command.addCommand(change_username_command);
auth_command.addCommand(status_command);

export default auth_command;