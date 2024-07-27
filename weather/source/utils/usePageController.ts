import React, {useContext} from 'react';
export const PageContext = React.createContext({
	page: 'login',
	switchToPage: (
		page: string,
		options?: {forgetCurrentPage?: boolean; data?: any},
	) => {},
	pop: (count?: number) => {
		return '' as string | undefined;
	},
	returnToLastPage: () => {},
	pageStack: ['login'],
	data: undefined as any,
	setEscapeDisabled: (value: boolean) => {},
});

export default function () {
	const context = useContext(PageContext);
	return context;
}
