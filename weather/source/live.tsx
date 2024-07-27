import {useApp, useInput, Box, Text} from 'ink';
import React, {useState, useEffect, useMemo} from 'react';
import FullscreenPage from './components/fullscreen-page.js';
import config from './config/config.js';
import axios from 'axios';
import Spinner from 'ink-spinner';
import {DateTime} from 'luxon';

export type LiveConfig = {};

export default function Live({}: LiveConfig) {
	const [loading, setLoading] = useState(true);
	const [sensors, setSensors] = useState<{slug: string; name: string}[]>([]);
	const [records, setRecords] = useState<any>({});
	const [startIndex, setStartIndex] = useState(0);
	const [sensorListVisibleLength, setSensorListVisibleLength] = useState(
		calculateSensorListVisibleLength(process.stdout.rows),
	);
	const maxStartIndex = useMemo(() => {
		const newMaxIndex = Math.max(
			Object.keys(records).length - 1 - sensorListVisibleLength,
			0,
		);
		if (startIndex > newMaxIndex) setStartIndex(newMaxIndex);
		return newMaxIndex;
	}, [records, sensorListVisibleLength]);

	function calculateSensorListVisibleLength(rows: number) {
		return Math.floor((rows - 4) / 3);
	}

	useInput((input, key) => {
		if (key.downArrow) setStartIndex(Math.min(maxStartIndex, startIndex + 1));
		else if (key.upArrow) setStartIndex(Math.max(0, startIndex - 1));
	});

	async function loadSensors() {
		try {
			const sensors = await axios({
				url: `${config.get('api_url')}/weather-stations/${config.get(
					'selected_station',
				)}/sensors`,
				method: 'get',
				headers: {
					OWVISION_AUTH_TOKEN: config.get('auth_token'),
				},
			});
			if (sensors.data.success) {
				setSensors(sensors.data.data);
			}
		} catch (_) {}
	}

	useEffect(() => {
		loadSensors();
	}, []);

	useEffect(() => {
		if (sensors.length === 0) return;
		loadLiveData();
		const interval = setInterval(loadLiveData, 1000);
		return () => clearInterval(interval);
	}, [sensors]);

	async function loadLiveData() {
		try {
			const newRecords: any = {};
			for (const sensor of sensors) {
				const liveData = await axios({
					url: `${config.get('api_url')}/weather-stations/${config.get(
						'selected_station',
					)}/sensors/${sensor.slug}/now`,
					method: 'get',
					headers: {
						OWVISION_AUTH_TOKEN: config.get('auth_token'),
					},
				});

				if (liveData.data.success && liveData.data.data.value !== null) {
					newRecords[sensor.slug] = liveData.data.data;
				} else {
					newRecords[sensor.slug] = undefined;
				}
			}

			await setRecords(newRecords);
			if (loading) setLoading(false);
		} catch (_) {}
	}

	return (
		<FullscreenPage
			paddingVertical={1}
			paddingHorizontal={4}
			alignItems="center"
			justifyContent="flex-start"
			flexDirection="column"
			onResize={(width, height) => {
				setSensorListVisibleLength(calculateSensorListVisibleLength(height));
			}}
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
						<Text>Loading weather data</Text>
						<Spinner type="aesthetic"></Spinner>
					</>
				) : (
					<>
						<Box>
							<Text>{startIndex !== 0 ? '▲' : ' '}</Text>
						</Box>
						{sensors
							.filter(sensor => {
								if (config.get('only_show_connected_sensors'))
									return records[sensor.slug] !== undefined;
								else return true;
							})
							.filter((_, index) => {
								return (
									index >= startIndex &&
									index < startIndex + sensorListVisibleLength
								);
							})
							.map(sensor => {
								const record = records[sensor.slug];
								const disconnected = record === undefined;
								let value = '-';
								let time_ago_string = '-';
								let unit = '';
								if (!disconnected) {
									value = record.value.toFixed(1);
									const created_at = DateTime.fromISO(record.created_at);
									const diff_years = -created_at.diffNow('years').years;
									const diff_months = -created_at.diffNow('months').months;
									const diff_days = -created_at.diffNow('days').days;
									const diff_hours = -created_at.diffNow('hours').hours;
									const diff_minutes = -created_at.diffNow('minutes').minutes;
									const diff_seconds = -created_at.diffNow('seconds').seconds;

									if (diff_years > 1) {
										time_ago_string = `${diff_years.toFixed(0)}y ago`;
									} else if (diff_months > 1) {
										time_ago_string = `${diff_months.toFixed(0)}m ago`;
									} else if (diff_days > 1) {
										time_ago_string = `${diff_days.toFixed(0)}d ago`;
									} else if (diff_hours > 1) {
										time_ago_string = `${diff_hours.toFixed(0)}h ago`;
									} else if (diff_minutes > 1) {
										time_ago_string = `${diff_minutes.toFixed(0)}min ago`;
									} else if (diff_seconds > 1) {
										time_ago_string = `${diff_seconds.toFixed(0)}s ago`;
									} else {
										time_ago_string = 'now';
									}
									if (record.unit !== 'none') unit = record.unit;
								}

								return (
									<Box
										key={sensor.slug}
										width={process.stdout.columns < 110 ? '80%' : 90}
										paddingLeft={1}
										paddingRight={1}
										borderStyle={'round'}
										borderColor={disconnected ? 'gray' : 'whiteBright'}
									>
										<Box
											borderStyle={'bold'}
											borderLeft={false}
											borderBottom={false}
											borderTop={false}
											marginRight={2}
											alignItems="center"
											justifyContent="center"
											width={'45%'}
											paddingLeft={1}
											paddingRight={1}
											borderColor={disconnected ? 'gray' : 'whiteBright'}
										>
											<Text
												wrap="truncate-end"
												italic
												color={disconnected ? 'gray' : 'whiteBright'}
											>
												{sensor.name}
											</Text>
										</Box>
										<Box
											width={'30%'}
											alignItems="center"
											justifyContent="center"
											borderStyle={'bold'}
											borderLeft={false}
											borderBottom={false}
											borderTop={false}
											marginRight={2}
											borderColor={disconnected ? 'gray' : 'whiteBright'}
										>
											<Text
												wrap="truncate-end"
												color={disconnected ? 'gray' : 'whiteBright'}
											>
												<Text bold>{value}</Text> {unit}
											</Text>
										</Box>
										<Box
											alignItems="center"
											justifyContent="center"
											width={'25%'}
										>
											<Text wrap="truncate-end" color={'gray'}>
												{time_ago_string}
											</Text>
										</Box>
									</Box>
								);
							})}
						<Box>
							<Text>{startIndex !== maxStartIndex ? '▼' : ' '}</Text>
						</Box>
					</>
				)}
			</Box>
		</FullscreenPage>
	);
}
