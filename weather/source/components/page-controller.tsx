import React, {useEffect, useState} from 'react';
import {Box, Spacer, Text, useApp, useInput} from 'ink';
import {PageContext} from '../utils/usePageController.js';
import config from '../config/config.js';
import axios from 'axios';
import {gracefulExit} from 'exit-hook';

type PageControllerProps = {
	initialPage: string;
	pages: {name: string; component: React.ReactElement}[];
	onApplicationExit?: () => Promise<void> | void;
};

export default function PageController({
	initialPage,
	pages,
	onApplicationExit,
}: PageControllerProps) {
	const [page, setPage] = useState(initialPage);
	const [pageStack] = useState<string[]>([initialPage]);
	const [data, setData] = useState<any>(undefined);
	const [escapeDisabled, setEscapeDisabled] = useState(false);
	const {exit} = useApp();

	async function exitApplication() {
		if (onApplicationExit) await onApplicationExit();
		exit();
		gracefulExit();
	}

	function switchToPage(
		page: string,
		options?: {
			forgetCurrentPage?: boolean;
			data?: any;
		},
	) {
		if (options?.forgetCurrentPage) pageStack.pop();
		if (options?.data !== undefined) {
			setData(options.data);
		}
		pageStack.push(page);
		setPage(page);
	}

	function returnToLastPage() {
		if (pageStack.length === 1) {
			exitApplication();
			return;
		}
		pageStack.pop();
		setPage(pageStack[pageStack.length - 1]!);
	}

	useInput((input, key) => {
		if (!escapeDisabled && key.escape) returnToLastPage();
	});

	function pop(count: number = 1) {
		for (let i = 0; i < count - 1; i++) {
			pageStack.pop();
		}
		return pageStack.pop();
	}

	return (
		<>
			<PageContext.Provider
				value={{
					page,
					pageStack,
					returnToLastPage,
					switchToPage,
					data,
					setEscapeDisabled,
					pop,
				}}
			>
				{pages.map(p => {
					if (p.name === page) {
						return p.component;
					} else {
						return '';
					}
				})}
			</PageContext.Provider>
		</>
	);
}
