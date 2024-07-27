import {useApp, useInput, Box, Text} from 'ink';
import React, {useState, useEffect} from 'react';
import FullscreenPage from './components/fullscreen-page.js';
import Logo from './components/logo.js';
import Input from './components/input.js';
import Button from './components/button.js';
import usePageController from './utils/usePageController.js';
import config from './config/config.js';
import axios from 'axios';
import Spinner from 'ink-spinner';
import {InterfaceMetaInformation} from 'owvision-environment/interfaces';
import Form from './components/form.js';

export type InstallInterfaceProps = {};

export default function InstallInterface({}: InstallInterfaceProps) {
	const [installedInterface, setInstalledInterface] = useState<null | {
		slug: string;
		meta_information: InterfaceMetaInformation;
	}>(null);
	const {returnToLastPage} = usePageController();

	async function installInterface(values: {repository_url: string}) {
		try {
			const response = await axios({
				url: `${config.get('api_url')}/interfaces`,
				data: {
					repository_url: values.repository_url,
				},
				headers: {
					'Content-Type': 'application/json',
					OWVISION_AUTH_TOKEN: config.get('auth_token'),
				},
				method: 'post',
				timeout: 80 * 1000,
			});
			if (!response.data.success) {
				if (response.data.error.code === 'E_VALIDATION_ERROR') {
					return 'Invalid url entered!';
				} else {
					return 'Failed to install interface!';
				}
			} else {
				setInstalledInterface(response.data.data);
				return true;
			}
		} catch (err) {
			return 'Failed to connect to owvision demon!';
		}
	}

	return (
		<FullscreenPage>
			<Box flexDirection="column" alignItems="center">
				{installedInterface === null && (
					<>
						<Text italic>Please enter the interface's git repository url</Text>
						<Box flexDirection="column" alignItems="center">
							<Form
								direction="vertical"
								submitText="Install interface"
								loadingText=""
								submit={installInterface}
							>
								<Input
									required
									selectable
									name="repository_url"
									placeholder="url"
									fixedWidth={40}
								/>
							</Form>
						</Box>
					</>
				)}
				{installedInterface && (
					<>
						<Text color="greenBright">
							Successfully installed interface{' '}
							<Text bold>{installedInterface.meta_information.name}</Text>!
						</Text>
						<Box paddingLeft={2} paddingRight={2} borderStyle={'doubleSingle'}>
							<Text italic>
								{installedInterface.meta_information.description}
							</Text>
						</Box>
						<Button
							selected={true}
							text="Continue"
							onClick={() => returnToLastPage()}
						/>
					</>
				)}
			</Box>
		</FullscreenPage>
	);
}
