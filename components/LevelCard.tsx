import React from "react";
import Image from "next/image";

export interface LevelCardProps {
  id: string;
  year: string;
  imageSrc: string;
  maxStars: number;
  collectedStars?: number;
  className?: string;
  disabled?: boolean;
  next?: boolean;
}

const LevelCard: React.FC<LevelCardProps> = ({
  id,
  imageSrc,
  className = "",
  disabled = false,
  collectedStars,
  maxStars,
  year,
  next = false,
}) => {
  const handleClick = () => {
    if (disabled) return;
  };
  return (
    <article
      id={id}
      className={`level-card group relative rounded-2xl bg-lightgray mt-10 w-56 h-80 ${className} ${
        disabled ? "opacity-50 pointer-events-none" : ""
      } ${
        next
          ? "bg-red shadow-[0px_22px_16px_-2px_rgba(0,_0,_0,_0.3)]"
          : "shadow-sm"
      }`}
      onClick={handleClick}
      role={"button"}
      aria-disabled={disabled || undefined}
    >
      <p className="absolute left-1/2 -top-10 transform -translate-x-1/2 font-light text-xl">
        {year}
      </p>
      <div className=" w-full overflow-hidden rounded-t-sm bg-gray-100">
        <img
          src={imageSrc}
          alt={year}
          className={`h-auto w-full object-cover transition-transform duration-200 ${
            disabled ? " blur-xs" : ""
          }`}
        />
      </div>

      <header className="mb-1 flex mt-5 justify-center items-center gap-3.5">
        <img src="image/Sun.png" alt={year} width={45} height={45} />
        <p
          className={` ${
            next ? "text-white" : "text-gray-600"
          } font-medium text-xl`}
        >
          {collectedStars ?? 0}/{maxStars}
        </p>
      </header>
    </article>
  );
};

export default LevelCard;
