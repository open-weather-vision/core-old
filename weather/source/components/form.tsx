import {Box, Text, useInput} from 'ink';
import React, {
	PropsWithChildren,
	useState,
	useEffect,
	Children,
	ReactElement,
	ReactNode,
} from 'react';
import Input, {InputProps} from './input.js';
import Button from './button.js';
import SelectionArea from './selection-area.js';
import Spinner from 'ink-spinner';
import usePageController from '../utils/usePageController.js';
import logger from '../utils/logger.js';

export type FormProps = {
	submitText: string;
	nextText?: string;
	direction: 'vertical' | 'horizontal';
	submit?: (values: any) => Promise<true | string> | true | string;
	children: ReactElement<InputProps> | Array<ReactElement<InputProps>>;
	loadingText?: string;
	customSpinner?: ReactNode;
	maxHeight?: number;
};

export default function Form(props: FormProps) {
	const [error, setError] = useState('');
	const [loading, setLoading] = useState(false);
	const [page, setPage] = useState(0);
	const {setEscapeDisabled} = usePageController();

	useEffect(() => {
		if (page === 0) {
			setEscapeDisabled(false);
		} else {
			setEscapeDisabled(true);
		}
	}, [page]);

	let invalidationStates: [
		boolean,
		React.Dispatch<React.SetStateAction<boolean>>,
	][] = [];
	let inputStates: [string, React.Dispatch<React.SetStateAction<string>>][] =
		[];

	Children.forEach(props.children, child => {
		inputStates.push(useState(''));
		invalidationStates.push(useState(false));
	});

	function setInputValue(index: number, value: string) {
		invalidationStates[index]![1](false);
		inputStates[index]![1](value);
	}

	function setInvalid(index: number) {
		invalidationStates[index]![1](true);
	}

	useInput((input, key) => {
		if (key.escape && page > 0) {
			setPage(page - 1);
		}
	});

	async function nextPage() {
		// Validate
		let validationError = false;
		Children.forEach(props.children, (input, index) => {
			if (
				index < page * props.maxHeight! ||
				index >= (page + 1) * props.maxHeight!
			)
				return;
			if (validationError) return;
			const value = inputStates[index]![0];

			if (input.props.required && value === '') {
				validationError = true;
				setInvalid(index);
				return setError('Please fill out the required field!');
			}
			if (input.props.validate) {
				const result = input.props.validate(value);
				if (result !== true) {
					setInvalid(index);
					validationError = true;
					return setError(result);
				}
			}
		});
		if (validationError) return;

		// Next page
		setPage(page + 1);
	}

	async function submit() {
		// Validate
		let validationError = false;
		const values: any = {};
		Children.forEach(props.children, (input, index) => {
			if (validationError) return;
			const value = inputStates[index]![0];

			if (input.props.required && value === '') {
				validationError = true;
				setInvalid(index);
				return setError('Please fill out the required field!');
			}
			if (input.props.validate) {
				const result = input.props.validate(value);
				if (result !== true) {
					setInvalid(index);
					validationError = true;
					return setError(result);
				}
			}

			values[input.props.name] = value;
		});
		if (validationError) return;

		// Submit
		setLoading(true);
		let success: true | string = true;
		if (props.submit) {
			const mightBePromise = props.submit(values);
			if (mightBePromise instanceof Promise) success = await mightBePromise;
			else success = mightBePromise;
		}
		if (success !== true) {
			setError(success);
		}
		setLoading(false);
		setEscapeDisabled(false);
	}

	const onLastPage =
		props.maxHeight === undefined ||
		(page + 1) * props.maxHeight >= Children.count(props.children);
	return (
		<SelectionArea direction={props.direction} tab return>
			{...Children.map(props.children, (input, index) => {
				return (
					<Input
						{...input.props}
						key={index}
						selectable
						initial={
							inputStates[index]![0] === ''
								? input.props.initial
								: inputStates[index]![0]
						}
						_invalid={invalidationStates[index]![0]}
						_setError={setError}
						_setValue={(value: string) => setInputValue(index, value)}
					/>
				);
			}).slice(
				page * (props.maxHeight ?? 0),
				props.maxHeight ? (page + 1) * props.maxHeight : undefined,
			)}
			{onLastPage ? (
				<Button
					selectable
					text={props.submitText}
					fixedWidth={40}
					onClick={submit}
				/>
			) : (
				<Button
					selectable
					text={props.nextText ?? 'Next step'}
					fixedWidth={40}
					onClick={nextPage}
					resetSelectionAreaOnClick
				/>
			)}
			{!loading && <Text color={'redBright'}>{error || ' '}</Text>}
			{loading && (
				<Box flexDirection="row">
					{props.customSpinner ?? <Spinner type={'aesthetic'} />}
					<Text>{' ' + (props.loadingText ?? '')}</Text>
				</Box>
			)}
		</SelectionArea>
	);
}
