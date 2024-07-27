import React, {useContext} from 'react';
export const FullscreenContext = React.createContext({
	width: process.stdout.columns,
	height: process.stdout.rows,
});

export default function () {
	const context = useContext(FullscreenContext);
	return context;
}
