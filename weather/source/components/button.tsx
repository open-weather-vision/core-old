import {ForegroundColorName} from 'chalk';
import {useApp, useInput, Box, Text} from 'ink';
import React, {useEffect, useMemo, useState} from 'react';
import logger from '../utils/logger.js';
import useSelectionArea from '../utils/useSelectionArea.js';

export type ButtonProps = {
	text?: string;
	onClick?: () => void;
	fixedWidth?: number | string;
	borderColor?: ForegroundColorName;
	color?: ForegroundColorName;
	selectedColor?: ForegroundColorName;
	selected?: boolean;
	selectable?: boolean;
	onSelect?: () => void;
	onDeselect?: () => void;
	resetSelectionAreaOnClick?: boolean;
};

export default function Button(props: ButtonProps) {
	const {selectFirst, setButtonSelected} = useSelectionArea();

	function onClick() {
		if (props.resetSelectionAreaOnClick) selectFirst();
		if (props.onClick) props.onClick();
	}

	useInput((input, key) => {
		if (props.selected && key.return) {
			onClick();
		}
	});

	function onSelect() {
		setButtonSelected(true);
		if (props.onSelect) props.onSelect();
	}

	function onDeselect() {
		setButtonSelected(false);
		if (props.onDeselect) props.onDeselect();
	}

	useEffect(() => {
		if (props.selected) onSelect();
		else onDeselect();
	}, [props.selected]);

	return (
		<Box
			marginBottom={0}
			borderStyle={'round'}
			paddingLeft={1}
			paddingRight={1}
			width={props.fixedWidth ?? 'auto'}
			alignItems="center"
			justifyContent="center"
			minHeight={3}
			borderColor={props.borderColor ?? 'whiteBright'}
		>
			<Text
				color={
					props.selected
						? props.selectedColor ?? 'greenBright'
						: props.color ?? 'whiteBright'
				}
				underline={props.selected}
			>
				{props.text ?? ''}
			</Text>
		</Box>
	);
}
