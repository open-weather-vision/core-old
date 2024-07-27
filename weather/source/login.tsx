import {useApp, useInput, Box, Text} from 'ink';
import React, {useState, useEffect} from 'react';
import FullscreenPage from './components/fullscreen-page.js';
import Logo from './components/logo.js';
import Input from './components/input.js';
import Button from './components/button.js';
import usePageController from './utils/usePageController.js';
import config from './config/config.js';
import axios from 'axios';
import Form from './components/form.js';

export type LoginProps = {};

export default function Login({}: LoginProps) {
	const [height, setHeight] = useState(process.stdout.rows);
	const {switchToPage} = usePageController();

	function onResize(width: number, height: number) {
		setHeight(height);
	}

	async function login(values: {username: string; password: string}) {
		try {
			const response = await axios({
				url: `${config.get('api_url')}/auth/login`,
				data: {
					username: values.username,
					password: values.password,
				},
				headers: {
					'Content-Type': 'application/json',
				},
				method: 'post',
			});

			if (!response.data.success) {
				return 'Invalid credentials entered!';
			}

			config.set_private('auth_token', response.data.data.auth_token);
			await config.save();
			switchToPage('menu', {
				forgetCurrentPage: true,
				data: 'broo',
			});
			return true;
		} catch (err) {
			return 'Failed to connect to owvision demon!';
		}
	}

	return (
		<FullscreenPage onResize={onResize}>
			<Box flexDirection="column" alignItems="center">
				{height > 17 && <Logo />}
				<Text italic>Please enter your credentials</Text>
				<Box flexDirection="column" alignItems="center">
					<Form submitText={'Login'} direction={'vertical'} submit={login}>
						<Input
							placeholder="username"
							fixedWidth={40}
							name="username"
							validate={value => {
								if (value.length < 5) return 'Minimum username length is 5';
								else return true;
							}}
							required
						/>
						<Input
							placeholder="password"
							fixedWidth={40}
							type="password"
							name="password"
							required
						/>
					</Form>
				</Box>
			</Box>
		</FullscreenPage>
	);
}
