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
import {
	ElevationUnits,
	HumidityUnits,
	PrecipationUnits,
	PressureUnits,
	SoilMoistureUnits,
	SolarRadiationUnits,
	TemperatureUnits,
	WindUnits,
} from 'owvision-environment/units';
import logger from './utils/logger.js';

export type CreateStation3Props = {};

const unitTypes = [
	{label: 'Precipation unit', type: 'precipation', choices: PrecipationUnits},
	{label: 'Wind unit', type: 'wind', choices: WindUnits},
	{label: 'Temperature unit', type: 'temperature', choices: TemperatureUnits},
	{
		label: 'Solar radiation unit',
		type: 'solar_radiation',
		choices: SolarRadiationUnits,
	},
	{label: 'Pressure unit', type: 'pressure', choices: PressureUnits},
	{
		label: 'Soil moisture unit',
		type: 'soil_moisture',
		choices: SoilMoistureUnits,
	},
	{
		label: 'Leaf temperature',
		type: 'leaf_temperature',
		choices: TemperatureUnits,
	},
	{
		label: 'Soil temperature unit',
		type: 'soil_temperature',
		choices: TemperatureUnits,
	},
	{
		label: 'Evapotranspiration unit',
		type: 'evo_transpiration',
		choices: PrecipationUnits,
	},
	{label: 'Humidity unit', type: 'humidity', choices: HumidityUnits},
	{label: 'Elevation unit', type: 'elevation', choices: ElevationUnits},
];

export default function CreateStation3({}: CreateStation3Props) {
	const [loading, setLoading] = useState(false);
	const {switchToPage, pop, data} = usePageController();

	const inputData: {
		interface_slug: string;
		name: string;
		slug: string;
		station_interface: {
			slug: string;
			meta_information: InterfaceMetaInformation;
		};
	} & {[Property in string]: any} = data;

	async function createStation(data: any) {
		const station = {
			...inputData,
			units: data,
			target_state: 'active',
			remote_recorder: false,
		};
		logger.info('Creating new weather station...');
		logger.info(station);
		try {
			const response = await axios({
				url: `${config.get('api_url')}/weather-stations`,
				method: 'post',
				headers: {
					OWVISION_AUTH_TOKEN: config.get('auth_token'),
				},
				data: station,
				timeout: 80 * 1000,
			});
			if (!response.data.success) {
				return response.data.error.message;
			} else {
				pop(2);
				switchToPage('station-list', {
					forgetCurrentPage: true,
				});
				return true as const;
			}
		} catch (err) {
			setLoading(false);
			return 'Failed to connect to owvision demon!';
		}
	}

	return (
		<FullscreenPage>
			<Box flexDirection="column" alignItems="center">
				<Box marginBottom={1}>
					<Text italic>Create a new weather station</Text>
				</Box>
				<Box flexDirection="column" alignItems="center">
					<Form
						direction="vertical"
						submitText="Create weather station"
						submit={createStation}
						maxHeight={3}
					>
						{unitTypes.map(unitType => (
							<Input
								label={unitType.label}
								name={unitType.type}
								required
								choices={unitType.choices.map(choice => ({
									text: choice,
									value: choice,
								}))}
								fixedWidth={40}
								type="select"
							/>
						))}
					</Form>
				</Box>
			</Box>
		</FullscreenPage>
	);
}
