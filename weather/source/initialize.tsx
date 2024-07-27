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
import SelectionArea from './components/selection-area.js';
import Spinner from 'ink-spinner';
import {exec} from 'node:child_process';
import {promisify} from 'node:util';
import path from 'node:path';
const awaitExec = promisify(exec);

export type InitializePageProps = {};

export default function InitializePage({}: InitializePageProps) {
	const [height, setHeight] = useState(process.stdout.rows);
	const {switchToPage} = usePageController();
	const [loading, setLoading] = useState(false);

	function onResize(width: number, height: number) {
		setHeight(height);
	}

	async function simpleSetup() {
		setLoading(true);
		const cli_dir = path.resolve(import.meta.dirname + '/../../api').toString();
		try {
			await awaitExec(`cd "${cli_dir}" && docker compose up -d --quiet-pull`);
			config.set_private('initialized', true);
			await config.save();
			await new Promise(resolve => setTimeout(resolve, 3000));
			switchToPage('login', {
				forgetCurrentPage: true,
			});
		} catch (err) {}
	}

	async function advancedSetup() {}

	return (
		<FullscreenPage onResize={onResize}>
			{loading && (
				<Box flexDirection="column" alignItems="center" justifyContent="center">
					<Box marginBottom={1}>
						<Spinner type="material" />
					</Box>
					<Text>Starting</Text>
				</Box>
			)}
			{!loading && (
				<Box flexDirection="column" alignItems="center" width={60}>
					{height > 17 && <Logo />}
					{height <= 17 && (
						<Box marginBottom={1}>
							<Text bold color={'blueBright'}>
								Welcome to owvision!
							</Text>
						</Box>
					)}
					<Box
						borderStyle={'single'}
						borderLeft={false}
						borderRight={false}
						borderTop={false}
						width={'100%'}
						justifyContent="center"
						alignItems="center"
						flexDirection="column"
					>
						<Text italic>
							A tool designed for managing any kind of weather station!
						</Text>
					</Box>
					<Text color={'gray'} wrap="wrap">
						We have noticed that this is your first time using owvision.
					</Text>
					<Text color={'gray'} wrap="wrap">
						To get started we need to set some things up.
					</Text>
					<Box flexDirection="row" alignItems="center" marginTop={1}>
						<SelectionArea direction="horizontal">
							<Button text="OK" selectable onClick={simpleSetup} />
							<Button
								borderColor="gray"
								color="gray"
								text="Advanced setup"
								selectable
							/>
						</SelectionArea>
					</Box>
				</Box>
			)}
		</FullscreenPage>
	);
}
