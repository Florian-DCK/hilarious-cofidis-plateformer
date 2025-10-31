'use client';

import React from "react";
import { useTranslations } from "next-intl";
import Button from "./Button";

type TutorialProps = {
  onClose?: () => void;
};

const Tutorial: React.FC<TutorialProps> = ({ onClose }) => {
  const t = useTranslations("tutorial");

  return (
    <section
      className={`tutorial flex max-w-1/2 flex-col justify-center items-center p-10 absolute z-50 transform -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2 bg-white bg-opacity-90 rounded-lg shadow-lg`}
    >
      <h2 className="text-center text-xl">
        {t.rich("title", {
          br: () => <br />,
        })}
      </h2>
      <div className="flex justify-center gap-10 items-center my-10">
        <img src="/image/arrows.png" className="w-36" alt="" />
        <p className=" max-w-1/2 font-light text-2xl">{t("instruction")}</p>
      </div>
      <Button className="w-fit" onClick={onClose}>
        {t("button")}
      </Button>
    </section>
  );
};

export default Tutorial;
