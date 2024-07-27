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
import logger from './utils/logger.js';

export type CreateStation1Props = {};

export default function CreateStation1({}: CreateStation1Props) {
	const [loading, setLoading] = useState(true);
	const {switchToPage, data} = usePageController();

	const inputData:
		| {
				interface_slug?: string;
				name?: string;
				slug?: string;
				station_interface?: {
					slug: string;
					meta_information: InterfaceMetaInformation;
				};
		  }
		| undefined = data;

	const [interfaces, setInterfaces] = useState<
		{meta_information: InterfaceMetaInformation; slug: string}[]
	>([]);

	async function loadInterfaces() {
		try {
			const response = await axios({
				url: `${config.get('api_url')}/interfaces`,
				method: 'get',
				headers: {
					OWVISION_AUTH_TOKEN: config.get('auth_token'),
				},
			});
			if (response.data.success) {
				setInterfaces(response.data.data);
			}
		} catch (_) {}
		setLoading(false);
	}

	useEffect(() => {
		loadInterfaces();
	}, []);

	function loadSelectedInterface(data: {
		interface_slug: string;
		name: string;
		slug: string;
	}) {
		switchToPage('create-station-2', {
			data: {
				...data,
				station_interface: interfaces.find(
					station_interface => station_interface.slug === data.interface_slug,
				),
			},
		});
		return true as const;
	}

	return (
		<FullscreenPage>
			<Box flexDirection="column" alignItems="center">
				{loading && (
					<>
						<Spinner type="aesthetic" />
						<Text>Loading</Text>
					</>
				)}
				{!loading && (
					<>
						<Box marginBottom={1}>
							<Text italic>Create a new weather station</Text>
						</Box>
						{interfaces.length === 0 && (
							<>
								<Box
									borderStyle={'singleDouble'}
									borderColor={'redBright'}
									paddingLeft={2}
									paddingRight={2}
									alignItems="center"
									justifyContent="center"
									width={60}
								>
									<Text color={'redBright'}>
										Can't create a weather station without any interface
										installed. Please install an interface first.
									</Text>
								</Box>

								<Button
									text="Install an interface"
									selectable
									selected={true}
									onClick={() => switchToPage('install-interface')}
								/>
							</>
						)}
						{interfaces.length > 0 && (
							<Box flexDirection="column" alignItems="center">
								<Form
									direction="vertical"
									submitText="Next step"
									submit={loadSelectedInterface}
								>
									<Input
										required
										name="interface_slug"
										selectable
										fixedWidth={40}
										type="select"
										label="interface"
										initial={inputData?.interface_slug}
										choices={interfaces.map(installed_interface => ({
											text: installed_interface.meta_information.name,
											value: installed_interface.slug,
										}))}
									/>
									<Input
										name="name"
										selectable
										fixedWidth={40}
										type="text"
										initial={inputData?.name ?? ''}
										label="station name"
										placeholder="My Cool Station"
										required
									/>
									<Input
										name="slug"
										selectable
										fixedWidth={40}
										initial={inputData?.slug ?? ''}
										type="text"
										label="station slug"
										placeholder="my-cool-station"
										required
									/>
								</Form>
							</Box>
						)}
					</>
				)}
			</Box>
		</FullscreenPage>
	);
}
