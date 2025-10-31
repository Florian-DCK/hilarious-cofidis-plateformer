// 'use client';
import { useTranslations } from "next-intl";
import Image from "next/image";
import Button from "@/components/Button";
import Footer from "@/components/Footer";

export default function Home() {
  const t = useTranslations("Home");

  return (
    <div className="items-center justify-center font-sans">
      <div className=" flex flex-col lg:flex-row items-center justify-center font-sans">
        <section className="items-start flex flex-col mx-6 lg:mx-0 lg:mr-20">
          <h1 className=" text-xl lg:text-4xl mt-5 lg:mt-0 font-medium mb-1 decoratedRed py-2 slideLeftAppear">
            {t("title")}
          </h1>
          <h1 className=" text-lg text-center lg:text-3xl font-medium mb-8 ml-16 decoratedYellow py-3 slideRightAppear">
            {t("subtitle")}
          </h1>
          <Image
            src="/image/homeHero.png"
            width={770}
            height={851}
            alt={t("imageAlt")}
            className="w-[600px] popupAppear lg:hidden"
          />
          <p className="text-lg text-black max-w-md slideLeftAppear">
            {t.rich("predescription", {
              br: () => <br />,
            })}
          </p>
          <p className="text-lg font-light text-black max-w-md slideLeftAppear">
            {t.rich("description", {
              strong: (chunks) => <strong>{chunks}</strong>,
            })}
          </p>
          <Button redirect="/register" className="mt-4 slideLeftAppear mx-auto">
            {t("CTA")}
          </Button>
        </section>
        <section className="hidden lg:block">
          <Image
            src="/image/homeHero.png"
            width={770}
            height={851}
            alt={t("imageAlt")}
            className="w-[600px] popupAppear"
          />
        </section>
      </div>
      <Footer />
    </div>
  );
}
