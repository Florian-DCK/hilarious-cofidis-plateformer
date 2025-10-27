import React from 'react';
import { useTranslations } from 'next-intl';
import Brand from '@/components/svg/Brand';
import LanguageSwitch from './LanguageSwitch';

const Header: React.FC = () => {
	const t = useTranslations('Header');

	return (
		<header className="font-sans flex items-center justify-between px-48 h-32 drop-shadow-md bg-white ">
			<Brand />
			<h1 className="text-2xl font-medium ">{t('CatchPhrase')}</h1>
			<LanguageSwitch />
		</header>
	);
};

export default Header;
