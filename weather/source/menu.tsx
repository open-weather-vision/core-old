import {useApp, useInput, Box, Text} from 'ink';
import React, {useState, useEffect} from 'react';
import FullscreenPage from './components/fullscreen-page.js';
import Logo from './components/logo.js';
import usePageController from './utils/usePageController.js';
import Button from './components/button.js';
import SelectionArea from './components/selection-area.js';

export type MenuProps = {
	items: {
		text: string;
		description: string;
		page?: string;
	}[];
};

export default function Menu({items}: MenuProps) {
	const [height, setHeight] = useState(process.stdout.rows);
	const {switchToPage} = usePageController();
	const [selected, setSelected] = useState(0);

	function onResize(width: number, height: number) {
		setHeight(height);
	}

	return (
		<FullscreenPage onResize={onResize}>
			<Box flexDirection="column" alignItems="center">
				{height > 17 && <Logo />}
				<Text italic>What do you want to do?</Text>
				<Box flexDirection="row">
					<SelectionArea direction="horizontal" tab>
						{items.map((item, index) => (
							<Button
								selectable
								key={index}
								text={item.text}
								onSelect={() => setSelected(index)}
								onClick={() => item.page && switchToPage(item.page)}
							/>
						))}
					</SelectionArea>
				</Box>
				<Text color={'grey'}>{items[selected]?.description}</Text>
			</Box>
		</FullscreenPage>
	);
}
