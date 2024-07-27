import jsonfile from 'jsonfile';
import clone from 'clone';
import {existsSync, mkdirSync} from 'fs';

type ConfigData = {
	public: PublicConfig;
	private: PrivateConfig;
};

type PublicConfig = {
	api_url: string;
	remote_station: boolean;
	debug_mode: boolean;
	only_show_connected_sensors: boolean;
};

type PrivateConfig = {
	auth_token: string | null;
	selected_station: string | null;
	selected_interface: string | null;
	initialized: boolean;
};

type PrivateConfigKey = keyof PrivateConfig;
type PublicConfigKey = keyof PublicConfig;
type ConfigKey = PrivateConfigKey | PublicConfigKey;

const default_config: ConfigData = {
	public: {
		api_url: 'http://localhost:3333/v1',
		debug_mode: false,
		remote_station: false,
		only_show_connected_sensors: false,
	},
	private: {
		auth_token: null,
		selected_station: null,
		selected_interface: null,
		initialized: false,
	},
};

class Config {
	private readonly folder =
		(process.env['APPDATA'] ?? process.env['HOME']) + '/owvision';
	private readonly path = this.folder + '/config.json';
	private config_data: ConfigData;

	constructor() {
		try {
			this.config_data = jsonfile.readFileSync(this.path);
		} catch (err) {
			this.config_data = clone(default_config);
			if (!existsSync(this.folder)) {
				mkdirSync(this.folder);
			}
			this.save();
		}
	}

	async save() {
		await jsonfile.writeFile(this.path, this.config_data);
	}

	saveSync() {
		jsonfile.writeFileSync(this.path, this.config_data);
	}

	get<K extends ConfigKey>(
		key: K,
	):
		| (K extends PublicConfigKey
				? PublicConfig[K]
				: K extends PrivateConfigKey
				? PrivateConfig[K]
				: never)
		| undefined {
		if (key in this.config_data.public) {
			return this.config_data.public[key as PublicConfigKey] as any;
		}
		if (key in this.config_data.private) {
			return this.config_data.private[key as PrivateConfigKey] as any;
		}
		return undefined;
	}

	set<K extends PublicConfigKey>(key: K, value: PublicConfig[K]) {
		if (key in this.config_data.public) {
			if (value === 'true') value = true as any;
			else if (value === 'false') value = false as any;
			this.public_config[key] = value;
			return true;
		}
		return false;
	}

	set_private<K extends PrivateConfigKey>(key: K, value: PrivateConfig[K]) {
		if (key in this.config_data.private) {
			this.config_data.private[key] = value;
			return true;
		}
		return false;
	}

	reset() {
		this.config_data = clone(default_config);
		this.saveSync();
	}

	get public_config() {
		return this.config_data.public;
	}

	get private_config() {
		return this.config_data.private;
	}
}

export default new Config();
