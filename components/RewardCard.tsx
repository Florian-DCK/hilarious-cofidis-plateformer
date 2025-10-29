import React from "react";
import Image from "next/image";

export interface RewardCardProps {
  className?: string;
  disabled?: boolean;
}

const RewardCard: React.FC<RewardCardProps> = ({
  className = "",
  disabled = false,
}) => {
  const handleClick = () => {
    if (disabled) return;
    console.log(`Reward clicked`);
  };
  return (
    <article
      id="reward"
      className={`level-card group relative rounded-md  shadow-sm mt-10 w-56 h-80 ${className} ${
        disabled ? "opacity-50 pointer-events-none bg-lightgray" : "bg-yellow"
      }`}
      onClick={handleClick}
      role={"button"}
      aria-disabled={disabled || undefined}
    >
      <div className="w-full overflow-hidden absolute -top-12 rounded-t-sm flex justify-center">
        <img
          src="/image/fujifilm.png"
          alt="Fujifilm"
          className="w-44 transition-transform duration-200 group-hover:scale-105"
        />
      </div>
      <div className="absolute bottom-5 w-full">
        <p className="text-center text-xl text-gray-600">
          Fujifilm Instax
          <br />
          Mini Evo
        </p>
      </div>
    </article>
  );
};

export default RewardCard;
