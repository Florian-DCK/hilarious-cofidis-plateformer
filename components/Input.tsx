'use client';
import React, { useState, useRef } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

interface InputProps {
	placeholder?: string;
	name?: string;
	value?: string;
	id?: string;
	suffixe?: string;
	confirmationIcon?: React.ReactNode;
	errorIcon?: React.ReactNode;
	required?: boolean;
	className?: string;
	type?: string;
}

const Input: React.FC<InputProps> = ({
	placeholder,
	suffixe,
	confirmationIcon,
	errorIcon,
	required,
	name,
	value,
	className,
	type,
	id,
}) => {
	const [dateValue, setDateValue] = useState<Date | null>(null);
	const inputRef = useRef<HTMLInputElement | null>(null);
	const datePickerRef = useRef<any>(null);

	const handleDivClick = () => {
		if (type === 'date' && datePickerRef.current) {
			// Focus sur l'input du DatePicker
			const input = datePickerRef.current.input;
			if (input) input.focus();
		} else if (inputRef.current) {
			inputRef.current.focus();
		}
	};

	return (
		<div
			className={`${className} flex-1 border border-copygray rounded flex justify-between items-center h-16 px-5`}
			onClick={handleDivClick}
			style={{ cursor: 'text' }}>
			{type === 'date' ? (
				<DatePicker
					ref={datePickerRef}
					selected={dateValue}
					onChange={(date) => setDateValue(date)}
					placeholderText={placeholder || 'JJ / MM / AAAA'}
					dateFormat="dd / MM / yyyy"
					className="w-full h-full outline-none bg-transparent "
					name={name}
					id={id}
					required={required}
					showPopperArrow={false}
				/>
			) : (
				<input
					ref={inputRef}
					type={type}
					placeholder={placeholder}
					required={required}
					name={name}
					value={value}
					id={id}
					className="w-full h-full outline-none bg-transparent"
				/>
			)}
			{suffixe && <span className="text-copygray">{suffixe}</span>}
			{confirmationIcon}
			{errorIcon}
		</div>
	);
};

export default Input;
