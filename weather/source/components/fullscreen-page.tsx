import {Box, Text} from 'ink';
import React, {useState, useEffect} from 'react';
import {FullscreenContext} from '../utils/useFullscreenDimensions.js';

export type FullscreenPageProps = {
	children?: any;
	justifyContent?:
		| 'center'
		| 'flex-start'
		| 'flex-end'
		| 'space-between'
		| 'space-around';
	alignItems?: 'center' | 'flex-start' | 'flex-end' | 'stretch';
	padding?: number;
	paddingHorizontal?: number;
	paddingVertical?: number;
	flexDirection?: 'column' | 'row' | 'column-reverse' | 'row-reverse';
	onResize?: (width: number, height: number) => void;
};

export default function FullscreenPage({
	children,
	alignItems,
	justifyContent,
	padding,
	paddingHorizontal,
	paddingVertical,
	flexDirection,
	onResize,
}: FullscreenPageProps) {
	const [width, setWidth] = useState(process.stdout.columns);
	const [height, setHeight] = useState(process.stdout.rows);

	useEffect(() => {
		const timer = setInterval(() => {
			const widthChange = width !== process.stdout.columns;
			const heightChange = height !== process.stdout.rows;
			if (widthChange && heightChange) {
				setWidth(process.stdout.columns);
				setHeight(process.stdout.rows);
				if (onResize) onResize(process.stdout.columns, process.stdout.rows);
			} else if (widthChange) {
				setWidth(process.stdout.columns);
				if (onResize) onResize(process.stdout.columns, process.stdout.rows);
			} else if (heightChange) {
				setHeight(process.stdout.rows);
				if (onResize) onResize(process.stdout.columns, process.stdout.rows);
			}
		}, 25);

		return () => {
			clearInterval(timer);
		};
	}, [width, height]);
	return (
		<FullscreenContext.Provider value={{width, height}}>
			<Box
				width={width}
				height={height}
				alignItems={alignItems ?? 'center'}
				justifyContent={justifyContent ?? 'center'}
				paddingLeft={paddingHorizontal ?? padding ?? 0}
				paddingRight={paddingHorizontal ?? padding ?? 0}
				paddingTop={paddingVertical ?? padding ?? 0}
				paddingBottom={paddingVertical ?? padding ?? 0}
				flexDirection={flexDirection ?? 'row'}
			>
				{children}
			</Box>
		</FullscreenContext.Provider>
	);
}
