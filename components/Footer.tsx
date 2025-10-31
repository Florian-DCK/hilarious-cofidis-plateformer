import React from "react";
import { useTranslations } from "next-intl";

const Footer = () => {
  const t = useTranslations("Footer");

  return (
    <footer className="w-full py-10">
      <div className="container mx-auto">
        <ul className="flex flex-col md:flex-row justify-center gap-1 items-center text-sm text-black">
          <li>© Cofidis 2025 -</li>
          <li>
            <a href="#" className="hover:underline">
              {t("LegalNotice")} ·
            </a>
          </li>
          <li>
            <a href="#" className="hover:underline">
              {t("Cookies")} ·
            </a>
          </li>
          <li>
            <a href="#" className="hover:underline">
              {t("Rules")} ·
            </a>
          </li>
        </ul>
      </div>
    </footer>
  );
};

export default Footer;
