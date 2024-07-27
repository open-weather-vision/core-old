import {Box, Text, useInput} from 'ink';
import React, {useState, useMemo, PropsWithChildren, Children} from 'react';
import useFullscreenDimensions from '../utils/useFullscreenDimensions.js';

export type ReponsiveHeightConfig = {
	elementHeight: number;
	extraOffset: number;
};

export default function ReponsiveHeight(
	props: PropsWithChildren<ReponsiveHeightConfig>,
) {
	const {height} = useFullscreenDimensions();
	const [startIndex, setStartIndex] = useState(0);

	const visibleCount = useMemo(() => {
		return Math.floor((height - props.extraOffset - 4) / props.elementHeight);
	}, [height]);
	const maxStartIndex = useMemo(() => {
		const newMaxIndex = Math.max(
			Children.count(props.children) - 1 - visibleCount,
			0,
		);
		if (startIndex > newMaxIndex) setStartIndex(newMaxIndex);
		return newMaxIndex;
	}, [props.children, visibleCount]);

	useInput((input, key) => {
		if (key.downArrow) {
			if (startIndex === maxStartIndex) {
				setStartIndex(0);
			} else {
				setStartIndex(startIndex + 1);
			}
		} else if (key.upArrow) {
			if (startIndex === 0) {
				setStartIndex(maxStartIndex);
			} else {
				setStartIndex(startIndex - 1);
			}
		}
	});

	return (
		<>
			<Box>
				<Text>{startIndex !== 0 ? '▲' : ' '}</Text>
			</Box>
			{Children.toArray(props.children).filter(
				(_, index) => index >= startIndex && index < startIndex + visibleCount,
			)}
			<Box>
				<Text>{startIndex !== maxStartIndex ? '▼' : ' '}</Text>
			</Box>
		</>
	);
}
