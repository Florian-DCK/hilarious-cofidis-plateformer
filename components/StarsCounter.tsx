import React, { FC, memo } from "react";

type StarsCounterProps = {
  count?: number; // number of collected stars
  max?: number; // total stars to collect
  className?: string;
};

const StarsCounter: FC<StarsCounterProps> = ({
  count = 0,
  max = 5,
  className,
}) => {
  const normalizedCount = Math.max(0, Math.min(max, Math.floor(count)));
  const fillPercentage = (normalizedCount / max) * 100;

  return (
    <div className={` ${className || ""}`.trim()}>
      <div className="bg-lightgray h-4 rounded-3xl">
        <div
          className="bg-yellow h-4 rounded-3xl relative"
          style={{ width: `${fillPercentage}%` }}
        >
          <img
            className="absolute right-0 bottom-2 transform translate-x-1/2 translate-y-1/2 w-12 h-12 min-h-12 min-w-12"
            src="image/Sun.png"
            alt="sun"
          />
          <span className="absolute right-0 top-10 transform translate-x-1/2 text-xl font-light whitespace-nowrap w-auto">
            {normalizedCount} / {max}
          </span>
        </div>
      </div>
    </div>
  );
};

export default memo(StarsCounter);
