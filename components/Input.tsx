"use client";
import React, { useState, useRef } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

import { ZodType } from "zod";

interface InputProps {
  placeholder?: string;
  name?: string;
  value?: string;
  id?: string;
  suffixe?: string | React.ReactNode;
  successIcon?: React.ReactNode;
  errorIcon?: React.ReactNode;
  required?: boolean;
  className?: string;
  type?: string;
  zodSchema?: ZodType<string | Date>;
  valid?: boolean;
  suffixeIsSubmit?: boolean;
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
  zodSchema,
  valid,
  suffixeIsSubmit,
}) => {
  const [dateValue, setDateValue] = useState<Date | null>(null);
  const [isValid, setIsValid] = useState<boolean | null>(valid ?? null);
  const [touched, setTouched] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const datePickerRef = useRef<DatePicker | null>(null);

  // Synchronise l'état local avec la prop valid si elle change
  React.useEffect(() => {
    if (typeof valid === "boolean") {
      setIsValid(valid);
      setTouched(true);
    }
  }, [valid]);

  const handleDivClick = () => {
    if (type === "date" && datePickerRef.current) {
      const input = datePickerRef.current.input;
      if (input) input.focus();
    } else if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleDateChange = (date: Date | null) => {
    setDateValue(date);
    setTouched(true);
    if (!date || date === null) {
      setIsValid(null);
    } else if (zodSchema) {
      // Conversion en JJ/MM/AAAA pour la validation
      const day = String(date.getDate()).padStart(2, "0");
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const year = date.getFullYear();
      const dateStr = `${day}/${month}/${year}`;
      const result = zodSchema.safeParse(dateStr);
      setIsValid(result.success);
    } else {
      setIsValid(true);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setTouched(true);
    if (type === "date") {
      return;
    }
    if (val === "") {
      setIsValid(null);
    } else if (zodSchema) {
      const result = zodSchema.safeParse(val);
      setIsValid(result.success);
    } else {
      setIsValid(true);
    }
  };

  return (
    <div
      className={`${className} flex-1 border rounded flex justify-between items-center h-16 px-5 ${
        (touched || typeof valid === "boolean") && isValid === false
          ? "border-red-600"
          : "border-copygray"
      }`}
      onClick={handleDivClick}
      style={{ cursor: "text" }}
    >
      {type === "date" ? (
        <DatePicker
          ref={datePickerRef}
          selected={dateValue}
          onChange={handleDateChange}
          placeholderText={placeholder || "JJ / MM / AAAA"}
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
      {/* Affichage conditionnel : rien si vide, successIcon si valide, errorIcon si invalide */}

      {suffixeIsSubmit && suffixe ? (
        <button type="submit">{suffixe}</button>
      ) : null}

      {(touched || typeof valid === "boolean") &&
        isValid === true &&
        successIcon &&
        suffixeIsSubmit !== true}
      {(touched || typeof valid === "boolean") &&
        isValid === false &&
        errorIcon &&
        suffixeIsSubmit !== true}
      {!touched && suffixe && suffixeIsSubmit !== true && (
        <span className="text-copygray">{suffixe}</span>
      )}
    </div>
  );
};

export default Input;
