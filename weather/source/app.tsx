import React, {useEffect, useState} from 'react';
import {Box, Spacer, Text, useApp, useInput} from 'ink';
import Menu from './menu.js';
import StationList from './station-list.js';
import Login from './login.js';
import PageController from './components/page-controller.js';
import config from './config/config.js';
import axios from 'axios';
import Station from './station.js';
import Live from './live.js';
import './utils/exit.js';
import InterfaceList from './interface-list.js';
import InstallInterface from './install-interface.js';
import CreateStation1 from './create-station-1.js';
import InitializePage from './initialize.js';
import CreateStation2 from './create-station-2.js';
import CreateStation3 from './create-station-3.js';

type Props = {
	name: string | undefined;
};

axios.defaults.validateStatus = () => true;

export default function App({}: Props) {
	function initialPage() {
		if (!config.get('initialized')) return 'init';
		else if (config.get('auth_token') === null) return 'login';
		else return 'menu';
	}

	return (
		<PageController
			initialPage={initialPage()}
			pages={[
				{name: 'login', component: <Login />},
				{
					name: 'menu',
					component: (
						<Menu
							items={[
								{
									text: 'Manage stations',
									description:
										'Create, view and configurate your weather stations',
									page: 'station-list',
								},
								{
									text: 'Manage interfaces',
									description:
										'View and install interfaces for any weather station type',
									page: 'interface-list',
								},
								{
									text: 'Change settings',
									description: 'Change station independent settings',
								},
							]}
						/>
					),
				},
				{
					name: 'station-list',
					component: <StationList />,
				},
				{
					name: 'station',
					component: <Station />,
				},
				{
					name: 'live-view',
					component: <Live />,
				},
				{
					name: 'interface-list',
					component: <InterfaceList />,
				},
				{
					name: 'install-interface',
					component: <InstallInterface />,
				},
				{
					name: 'create-station-1',
					component: <CreateStation1 />,
				},
				{
					name: 'create-station-2',
					component: <CreateStation2 />,
				},
				{
					name: 'create-station-3',
					component: <CreateStation3 />,
				},
				{
					name: 'init',
					component: <InitializePage />,
				},
			]}
		/>
	);
}
