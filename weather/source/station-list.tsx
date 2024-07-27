import {useApp, useInput, Box, Text} from 'ink';
import React, {useState, useEffect} from 'react';
import FullscreenPage from './components/fullscreen-page.js';
import config from './config/config.js';
import axios from 'axios';
import Spinner from 'ink-spinner';
import Button from './components/button.js';
import usePageController from './utils/usePageController.js';
import SelectionArea from './components/selection-area.js';

export type StationListProps = {};

export default function StationList({}: StationListProps) {
	const [loading, setLoading] = useState(true);
	const [stations, setStations] = useState<{name: string; slug: string}[]>([]);
	const {switchToPage} = usePageController();

	async function loadStations() {
		try {
			const response = await axios({
				url: `${config.get('api_url')}/weather-stations`,
				method: 'get',
				headers: {
					OWVISION_AUTH_TOKEN: config.get('auth_token'),
				},
			});
			if (response.data.success) {
				setStations(response.data.data);
			}
		} catch (_) {}
		setLoading(false);
	}

	useEffect(() => {
		loadStations();
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
						<Text>Loading weather stations</Text>
						<Spinner type="aesthetic"></Spinner>
					</>
				) : (
					<>
						<Box marginBottom={1}>
							<Text italic bold>
								{stations.length > 0
									? 'Choose your station!'
									: `You haven't created any station yet!`}
							</Text>
						</Box>
						<SelectionArea direction="vertical" tab>
							{stations.map((station, index) => (
								<Button
									selectable
									onClick={() => {
										config.set_private('selected_station', station.slug);
										config.save();
										switchToPage('station');
									}}
									text={station.name}
									selectedColor="whiteBright"
									fixedWidth={40}
								/>
							))}
							<Button
								selectable
								onClick={() => switchToPage('create-station-1')}
								text="Create a new station"
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
