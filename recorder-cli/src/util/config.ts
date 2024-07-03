import jsonfile from "jsonfile";
import clone from "clone";
import { existsSync, mkdirSync, writeFileSync } from "fs";

type ConfigData = {
    public: ModifiableConfig,
}

type ModifiableConfig = {
    debug_mode: boolean,
}


type ConfigModifiableKey = keyof ModifiableConfig;
type ConfigNotModifiableKey = Exclude<keyof ConfigData, "public">
type ConfigKey = ConfigModifiableKey | ConfigNotModifiableKey;

const default_config: ConfigData = {
    public: {
        debug_mode: false,
    },
}

class Config{
    private readonly folder = process.env.APPDATA  + "/owvision";
    private readonly path = this.folder + "/config.json";
    private config_data: ConfigData = clone(default_config);

    constructor(){
        try {
            this.config_data = jsonfile.readFileSync(this.path);
        } catch (err) {
            if (!existsSync(this.folder)){
                mkdirSync(this.folder);
            }
            this.save();
        }
    }
    

    save(){
        jsonfile.writeFileSync(this.path, this.config_data);
    }

    get<K extends ConfigKey>(key: K): (K extends ConfigModifiableKey ? ModifiableConfig[K] : K extends ConfigNotModifiableKey ?  ConfigData[K] : never) | undefined {
        if(key in this.config_data){
            return this.config_data[key as ConfigNotModifiableKey] as any;
        }
        if(key in this.modifiable_config){
            return this.modifiable_config[key as ConfigModifiableKey] as any;
        }
        return undefined;
    }

    set<K extends ConfigModifiableKey>(key: K, value: ModifiableConfig[K]){
        if(key in this.modifiable_config){
            if(value as any === "true") value = true as any;
            else if(value as any === "false") value = false as any;
            this.modifiable_config[key] = value;
            return true;
        }
        return false;
    }

    set_not_modifiable<K extends ConfigNotModifiableKey>(key: K, value: ConfigData[K]){
        if(key in this.config_data){
            this.config_data[key as ConfigNotModifiableKey] = value;
            return true;
        }
        return false;
    }

    reset(){
        this.config_data = clone(default_config);
        this.save();
    }

    get modifiable_config(){
        return this.config_data.public;
    }
}

export default new Config();