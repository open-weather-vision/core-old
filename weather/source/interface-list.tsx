import {useApp, useInput, Box, Text} from 'ink';
import React, {useState, useEffect} from 'react';
import FullscreenPage from './components/fullscreen-page.js';
import config from './config/config.js';
import axios from 'axios';
import Spinner from 'ink-spinner';
import Button from './components/button.js';
import usePageController from './utils/usePageController.js';
import {InterfaceMetaInformation} from 'owvision-environment/interfaces';
import SelectionArea from './components/selection-area.js';

export type InterfaceListProps = {};

export default function InterfaceList({}: InterfaceListProps) {
	const [loading, setLoading] = useState(true);
	const [interfaces, setInterfaces] = useState<
		{meta_information: InterfaceMetaInformation; slug: string}[]
	>([]);
	const {switchToPage} = usePageController();

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

	return (
		<FullscreenPage
			paddingVertical={1}
			paddingHorizontal={4}
			alignItems="center"
			justifyContent="flex-start"
			flexDirection="column"
		>
			<Box
				flexDirection="column"
				alignItems="center"
				justifyContent="center"
				flexGrow={1}
			>
				{loading ? (
					<>
						<Spinner type="aesthetic"></Spinner>
						<Text>Loading interfaces</Text>
						<Spinner type="aesthetic"></Spinner>
					</>
				) : (
					<>
						<Box marginBottom={1}>
							<Text italic bold>
								{interfaces.length > 0
									? 'Choose an interface!'
									: `You haven't installed any interface yet!`}
							</Text>
						</Box>
						<SelectionArea direction="vertical" tab>
							{interfaces.map((station_interface, index) => (
								<Button
									selectable
									onClick={() => {
										config.set_private(
											'selected_interface',
											station_interface.slug,
										);
										config.save();
										//switchToPage('interface');
									}}
									text={station_interface.meta_information.name}
									selectedColor="whiteBright"
									fixedWidth={40}
								/>
							))}
							<Button
								selectable
								onClick={() => switchToPage('install-interface')}
								text="Install a new interface"
								borderColor="greenBright"
								fixedWidth={40}
							/>
						</SelectionArea>
					</>
				)}
			</Box>
		</FullscreenPage>
	);
}
