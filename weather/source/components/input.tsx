import {useApp, useInput, Box, Text} from 'ink';
import React, {useEffect, useMemo, useState} from 'react';

export class Validators {
	static float(min?: number, max?: number) {
		return (value: string) => {
			try {
				const number = Number.parseFloat(value);
				if (max && number > max) return `The maximum value is '${max}'!`;
				if (min && number < min) return `The minimum value is '${min}'!`;
				return true;
			} catch (err) {
				return 'Please enter a valid decimal!';
			}
		};
	}

	static integer(min?: number, max?: number) {
		return (value: string) => {
			try {
				const number = Number.parseInt(value);
				if (max && number > max) return `The maximum value is '${max}'!`;
				if (min && number < min) return `The minimum value is '${min}'!`;
				return true;
			} catch (err) {
				return 'Please enter a round number!';
			}
		};
	}

	static enum(values: string[]) {
		return (value: string) => {
			if (values.includes(value)) return true;
			else return `Invalid value entered!`;
		};
	}
}

export type InputProps = {
	initial?: string;
	name: string;
	label?: string;
	placeholder?: string;
	fixedWidth?: number | string;
	type?: 'text' | 'password' | 'select';
	choices?: {
		text: string;
		value: string;
	}[];
	validate?: (value: string) => true | string;
	required?: boolean;

	selectable?: boolean;
	selected?: boolean;

	_invalid?: boolean;
	_setValue?: (value: string) => void;
	_setError?: (error: string) => void;
};

export default function Input(props: InputProps) {
	const [isInitial, setIsInitial] = useState(true);
	const [text, setText] = useState(
		props.type === 'select' ? getTextAtIndex(0) : '',
	);
	const [cursor, setCursor] = useState('');
	const [selectedIndex, setSelectedIndex] = useState(0);

	useEffect(() => {
		if (isInitial && props.initial) {
			setIsInitial(false);
			if (props.type === 'select') {
				setSelectedIndex(
					props.choices?.findIndex(element => {
						return element.value === props.initial;
					}) ?? 0,
				);
			} else {
				setValue(props.initial);
				setText(props.initial);
			}
		}
	}, []);

	function getTextAtIndex(index: number) {
		return props.choices ? props.choices[index]?.text ?? '' : '';
	}

	function getValueAtIndex(index: number) {
		return props.choices ? props.choices[index]?.value ?? '' : '';
	}

	if (props.type === 'select') {
		useEffect(() => {
			setText(getTextAtIndex(selectedIndex) ?? '');
			setValue(getValueAtIndex(selectedIndex) ?? '');
		}, [props.choices, selectedIndex]);
	}

	useEffect(() => {
		let cursorVisible = false;
		const interval = setInterval(() => {
			if (cursorVisible) {
				hideCursor();
				cursorVisible = false;
			} else {
				showCursor();
				cursorVisible = true;
			}
		}, 1000);
		return () => clearInterval(interval);
	}, []);

	function showCursor() {
		setCursor('⎢');
	}

	function hideCursor() {
		setCursor(' ');
	}

	useInput((input, key) => {
		if (props.selected) {
			if (key.delete && props.type !== 'select') {
				const newText = text.slice(0, text.length - 1);
				setText(newText);
				showCursor();
				setValue(newText);
			} else if (
				!key.return &&
				!key.ctrl &&
				!key.downArrow &&
				!key.upArrow &&
				!key.tab &&
				props.type !== 'select'
			) {
				const newText = text + input;
				setText(newText);
				showCursor();
				setValue(newText);
			} else if (props.type === 'select' && key.leftArrow) {
				let nextIndex = selectedIndex - 1;
				if (nextIndex < 0) nextIndex = (props.choices?.length ?? 1) - 1;
				setSelectedIndex(nextIndex);
			} else if (props.type === 'select' && key.rightArrow) {
				let nextIndex = (selectedIndex + 1) % (props.choices?.length ?? 1);
				setSelectedIndex(nextIndex);
			}
		}
	});

	function setValue(value: string) {
		if (props._setValue) props._setValue(value);
		if (props._setError) props._setError('');
	}

	function renderInput() {
		if (props.type === 'text' || !props.type) {
			return text;
		} else if (props.type === 'password') {
			return '•'.repeat(text.length);
		} else if (props.type === 'select') {
			return text;
		}
		return '';
	}

	return (
		<Box flexDirection="column">
			{props.label && (
				<Text italic color={props.selected ? 'greenBright' : 'whiteBright'}>
					{props.label}
					{props.required && '*'}
				</Text>
			)}
			<Box
				marginBottom={0}
				borderStyle={props.selected ? 'bold' : 'single'}
				paddingLeft={1}
				paddingRight={1}
				width={props.fixedWidth ?? 'auto'}
				borderColor={
					props._invalid
						? props.selected
							? 'greenBright'
							: 'redBright'
						: props.selected
						? 'greenBright'
						: 'white'
				}
				alignItems={props.type === 'select' ? 'center' : 'flex-start'}
				justifyContent={
					props.type === 'select' ? 'space-between' : 'flex-start'
				}
			>
				{props.type === 'select' && <Text>◂</Text>}
				{text.length > 0 && (
					<Text
						wrap="truncate-start"
						color={props._invalid ? 'redBright' : 'whiteBright'}
					>
						{renderInput()}
						{props.type !== 'select' && props.selected && cursor}
					</Text>
				)}
				{text.length === 0 && (
					<Text color={'gray'} italic wrap="truncate-start">
						{(props.type !== 'select' && props.placeholder) ?? ' '}
					</Text>
				)}
				{props.type === 'select' && <Text>▸</Text>}
			</Box>
		</Box>
	);
}
