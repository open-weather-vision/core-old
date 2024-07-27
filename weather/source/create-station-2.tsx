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
import {
	InterfaceConfig,
	InterfaceMetaInformation,
} from 'owvision-environment/interfaces';
import Form from './components/form.js';

export type CreateStation2Props = {};

export default function CreateStation2({}: CreateStation2Props) {
	const [loading, setLoading] = useState(false);
	const {switchToPage, data} = usePageController();

	const inputData: {
		interface_slug: string;
		station_name: string;
		slug: string;
		station_interface: {
			slug: string;
			meta_information: InterfaceMetaInformation;
		};
		interface_config?: InterfaceConfig;
	} = data;

	function nextStep(data: {[Property in string]: any}) {
		inputData.interface_config =
			inputData.station_interface.meta_information.config;
		for (const key in inputData.interface_config) {
			inputData.interface_config[key]!.value = data[key];
		}
		switchToPage('create-station-3', {
			data: {
				...inputData,
				interface_config: inputData.interface_config,
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
						<Box flexDirection="column" alignItems="center">
							<Form
								direction="vertical"
								submitText="Next step"
								submit={nextStep}
								maxHeight={3}
							>
								{Object.keys(
									inputData.station_interface.meta_information.config ?? {},
								).map(argument_key => {
									const argument =
										inputData.station_interface.meta_information.config![
											argument_key
										]!;
									return (
										<Input
											name={argument_key}
											selectable
											fixedWidth={40}
											type={argument.type === 'select' ? 'select' : 'text'}
											choices={
												argument.type === 'select'
													? argument.choices?.map(choice => ({
															text: choice.title,
															value: choice.value,
													  }))
													: undefined
											}
											label={argument.name}
											initial={
												(inputData.interface_config &&
													inputData.interface_config[argument_key]!.value) ??
												(argument.value || '')
											}
											required
										/>
									);
								})}
							</Form>
						</Box>
					</>
				)}
			</Box>
		</FullscreenPage>
	);
}
