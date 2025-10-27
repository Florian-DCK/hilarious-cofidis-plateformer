'use client';
import { FC } from 'react';

const LanguageSwitch: FC = () => {
	return (
		<div className="flex gap-4">
			<button className="font-sans cursor-pointer w-12 h-12 rounded-full bg-yellow">
				FR
			</button>
			<button className="font-sans cursor-pointer w-12 h-12 rounded-full bg-copygray opacity-50">
				NL
			</button>
		</div>
	);
};

export default LanguageSwitch;
