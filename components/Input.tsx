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
	successIcon?: React.ReactNode;
	errorIcon?: React.ReactNode;
	required?: boolean;
	className?: string;
	type?: string;
}

const Input: React.FC<InputProps> = ({
	placeholder,
	suffixe,
	successIcon,
	errorIcon,
	required,
	name,
	value,
	className,
	type,
	id,
}) => {
	const [dateValue, setDateValue] = useState<Date | null>(null);
	const [isValid, setIsValid] = useState<boolean | null>(null);
	const inputRef = useRef<HTMLInputElement | null>(null);
	const datePickerRef = useRef<DatePicker | null>(null);

	const handleDivClick = () => {
		if (type === 'date' && datePickerRef.current) {
			const input = datePickerRef.current.input;
			if (input) input.focus();
		} else if (inputRef.current) {
			inputRef.current.focus();
		}
	};

	const handleDateChange = (date: Date | null) => {
		setDateValue(date);
		if (!date && required) {
			setIsValid(false);
		} else {
			setIsValid(true);
		}
	};

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const val = e.target.value;
		if (type === 'date') {
			// On ne gère pas ici, c'est DatePicker
			return;
		}
		if (required && val === '') {
			setIsValid(false);
		} else {
			setIsValid(true);
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
					onChange={handleDateChange}
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
					onChange={handleInputChange}
				/>
			)}
			{/* Affichage conditionnel : successIcon si valide, errorIcon si invalide, sinon suffixe */}
			{isValid === true && successIcon}
			{isValid === false && errorIcon}
			{isValid === null && suffixe && (
				<span className="text-copygray">{suffixe}</span>
			)}
		</div>
	);
};

export default Input;
