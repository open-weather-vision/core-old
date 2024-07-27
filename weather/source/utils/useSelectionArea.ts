import React, {useContext} from 'react';
export const SelectionAreaContext = React.createContext({
	selectFirst: () => {},
	setButtonSelected: (value: boolean) => {},
});

export default function () {
	const context = useContext(SelectionAreaContext);
	return context;
}
