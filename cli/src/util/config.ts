import jsonfile from "jsonfile";
import clone from "clone";

const config_file_path = "./config.json";

type ConfigData = {
    public: ModifiableConfig,
    selected_station: string | null
}

type ModifiableConfig = {
    api_url: string,
    auth_token: string | null,
}


type ConfigModifiableKey = keyof ModifiableConfig;
type ConfigNotModifiableKey = Exclude<keyof ConfigData, "public">
type ConfigKey = ConfigModifiableKey | ConfigNotModifiableKey;

const default_config: ConfigData = {
    public: {
        api_url: "http://localhost:3333/v1",
        auth_token: null,
    },
    selected_station: null
}

class Config{
    private readonly path = "./config.json";
    private config_data: ConfigData = clone(default_config);

    constructor(){
        try {
            this.config_data = jsonfile.readFileSync(config_file_path);
        } catch (err) {
            this.update();
        }
    }
    

    update(){
        jsonfile.writeFileSync(config_file_path, this.config_data);
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
        this.update();
    }

    get modifiable_config(){
        return this.config_data.public;
    }
}

export default new Config();