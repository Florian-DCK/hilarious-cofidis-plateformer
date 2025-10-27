'use client';
import React, { createContext, useContext, useState, ReactNode } from 'react';

type LocaleContextType = {
	locale: string;
	setLocale: (locale: string) => void;
	messages: Record<string, string>;
};

const LocaleContext = createContext<LocaleContextType | undefined>(undefined);

export const useLocaleContext = () => {
	const ctx = useContext(LocaleContext);
	if (!ctx) throw new Error('LocaleContext not found');
	return ctx;
};

export const LocaleProvider = ({
	children,
	defaultLocale = 'fr',
	defaultMessages,
}: {
	children: ReactNode;
	defaultLocale?: string;
	defaultMessages: Record<string, string>;
}) => {
	const [locale, setLocaleState] = useState(defaultLocale);
	const [messages, setMessages] = useState(defaultMessages);

	const setLocale = async (newLocale: string) => {
		document.cookie = `locale=${newLocale}; path=/`;
		const msgs = (await import(`../../messages/${newLocale}.json`)).default;
		setLocaleState(newLocale);
		setMessages(msgs);
	};

	return (
		<LocaleContext.Provider value={{ locale, setLocale, messages }}>
			{children}
		</LocaleContext.Provider>
	);
};
