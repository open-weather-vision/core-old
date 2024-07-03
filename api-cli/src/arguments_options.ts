import { Argument, Option } from "commander";
import config from "./util/config.js";

export const station_name_argument = new Argument("[station_name]", "the related weather station's short name").default(config.get("selected_station"))
export const sensors_only_option = new Option("-o, --only [sensor_names...]", "execute the command only on the passed sensors")
