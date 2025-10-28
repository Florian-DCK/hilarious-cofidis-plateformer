'use client';
import React from 'react';
import { useRouter } from 'next/navigation';
import Arrow from './svg/Arrow';

interface ButtonProps {
	onClick?: () => void;
	children: React.ReactNode;
	className?: string;
	redirect?: string;
	type?: 'button' | 'submit';
}

const Button: React.FC<ButtonProps> = ({
	onClick,
	children,
	className = '',
	redirect,
	type = 'button',
}) => {
	const router = useRouter();

	const handleClick = () => {
		if (redirect) {
			router.push(redirect);
		} else if (onClick) {
			onClick();
		}
	};

	return (
		<button
			onClick={handleClick}
			type={type}
			className={`${className} cursor-pointer bg-red text-white font-sans px-8 py-3 rounded-md hover:opacity-90 active:scale-95 transition-all flex items-center`}>
			{children}
			<Arrow className="inline-block ml-2" />
		</button>
	);
};

export default Button;
