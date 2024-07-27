import axios from 'axios';
import config from '../config/config.js';
import exitHook, {asyncExitHook} from 'exit-hook';

async function logout() {
	if (config.get('auth_token') !== null) {
		try {
			await axios({
				url: `${config.get('api_url')}/auth/logout`,
				headers: {
					'Content-Type': 'application/json',
					OWVISION_AUTH_TOKEN: config.get('auth_token'),
				},
				method: 'post',
			});
		} catch (_) {}
		config.set_private('auth_token', null);
		await config.save();
	}
}

asyncExitHook(
	async () => {
		await logout();
		process.stdout.write('\u001B[2J\u001B[0;0f');
	},
	{
		wait: 1000,
	},
);
