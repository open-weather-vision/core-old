import {ForegroundColorName} from 'chalk';
import {useApp, useInput, Box, Text, BoxProps} from 'ink';
import React, {
	Children,
	ReactElement,
	useState,
	PropsWithChildren,
	useMemo,
	useEffect,
} from 'react';
import ReponsiveHeight from './responsive-height.js';
import logger from '../utils/logger.js';
import {SelectionAreaContext} from '../utils/useSelectionArea.js';

export type SelectionAreaProps = {
	direction: 'horizontal' | 'vertical';
	return?: boolean;
	tab?: boolean;
};

export default function SelectionArea(
	props: PropsWithChildren<SelectionAreaProps>,
) {
	let selectableChildrenCount = 0;

	const [buttonSelected, setButtonSelected] = useState(false);
	const [selected, setSelected] = useState(0);
	const children = Children.map(props.children, (child, index) => {
		if (
			child &&
			typeof child === 'object' &&
			'props' in child &&
			'selectable' in child.props
		) {
			selectableChildrenCount++;
			return React.cloneElement(child, {
				...child.props,
				key: index,
				selected: index === selected,
			});
		} else {
			return child;
		}
	});

	function next() {
		setSelected((selected + 1) % selectableChildrenCount);
	}

	function previous() {
		let previous = selected - 1;
		if (previous < 0) previous = selectableChildrenCount - 1;
		setSelected(previous);
	}

	useInput((input, key) => {
		if (props.direction === 'vertical') {
			if (
				key.downArrow ||
				(props.return && key.return && !buttonSelected) ||
				(props.tab && key.tab)
			)
				next();
			else if (key.upArrow) previous();
		} else {
			if (
				key.rightArrow ||
				(props.return && key.return && !buttonSelected) ||
				(props.tab && key.tab)
			)
				next();
			else if (key.leftArrow || (props.tab && key.shift && key.tab)) previous();
		}
	});

	function selectFirst() {
		setSelected(0);
	}

	return (
		<SelectionAreaContext.Provider
			value={{
				selectFirst,
				setButtonSelected,
			}}
		>
			{children}
		</SelectionAreaContext.Provider>
	);
}
