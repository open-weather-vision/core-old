import {useApp, useInput, Box, Text} from 'ink';
import React, {useState, useEffect} from 'react';
import FullscreenPage from './components/fullscreen-page.js';
import config from './config/config.js';
import axios from 'axios';
import Spinner from 'ink-spinner';
import Button from './components/button.js';
import usePageController from './utils/usePageController.js';
import SelectionArea from './components/selection-area.js';

export type StationProps = {};

export default function Station({}: StationProps) {
	const [loading, setLoading] = useState(true);
	const [station, setStation] = useState<any>([]);
	const {switchToPage} = usePageController();

	async function loadStation() {
		try {
			const response = await axios({
				url: `${config.get('api_url')}/weather-stations/${config.get(
					'selected_station',
				)}`,
				method: 'get',
				headers: {
					OWVISION_AUTH_TOKEN: config.get('auth_token'),
				},
			});
			if (response.data.success) {
				setStation(response.data.data);
				setLoading(false);
			}
		} catch (_) {}
	}

	useEffect(() => {
		loadStation();
		const interval = setInterval(() => {
			loadStation();
		}, 5000);

		return () => clearInterval(interval);
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
						<Text>Loading weather station</Text>
						<Spinner type="aesthetic"></Spinner>
					</>
				) : (
					<>
						<Box marginBottom={1}>
							<Text bold italic>
								{station.name}
							</Text>
						</Box>
						<SelectionArea direction="vertical">
							<Button
								text="Settings"
								onClick={() => {}}
								selectable
								fixedWidth={40}
							/>
							<Button
								text="Live view"
								onClick={() => switchToPage('live-view')}
								selectable
								fixedWidth={40}
							/>
							<Button
								text="Summary view"
								onClick={() => {}}
								selectable
								fixedWidth={40}
							/>
						</SelectionArea>
						<Box
							width={40}
							borderStyle={'double'}
							paddingLeft={2}
							paddingRight={2}
							minHeight={3}
							justifyContent="space-between"
						>
							<Box alignSelf="flex-start">
								<Text
									color={
										station.connection_state === 'connected'
											? 'greenBright'
											: station.connection_state === 'connecting'
											? 'yellowBright'
											: station.connection_state === 'disconnected'
											? 'gray'
											: 'redBright'
									}
								>
									{station.connection_state === 'connected'
										? '✓ '
										: station.connection_state === 'connecting-failed'
										? '⨯  '
										: '● '}
									{station.connection_state}
								</Text>
							</Box>
							<Box alignSelf="flex-end">
								<Text color="gray">
									{station.remote_recorder ? 'on remote' : 'locally'}
								</Text>
							</Box>
						</Box>
					</>
				)}
			</Box>
		</FullscreenPage>
	);
}
