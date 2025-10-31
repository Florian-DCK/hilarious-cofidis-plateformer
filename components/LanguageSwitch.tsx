"use client";
import { FC, useEffect, useState, useTransition } from "react";
import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";

type LocaleCode = "fr" | "nl";

const COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1 year

const LanguageSwitch: FC = () => {
  const locale = useLocale() as LocaleCode;
  const router = useRouter();
  const [pendingLocale, setPendingLocale] = useState<LocaleCode | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setPendingLocale(null);
  }, [locale]);

  const handleSwitch = (nextLocale: LocaleCode) => {
    if (nextLocale === locale || isPending) {
      return;
    }

    const secureSuffix =
      typeof window !== "undefined" && window.location.protocol === "https:"
        ? "; Secure"
        : "";

    document.cookie = `locale=${nextLocale}; Path=/; Max-Age=${COOKIE_MAX_AGE}; SameSite=Lax${secureSuffix}`;
    setPendingLocale(nextLocale);

    startTransition(() => {
      router.refresh();
    });
  };

  const languages: Array<{ code: LocaleCode; label: string }> = [
    { code: "fr", label: "FR" },
    { code: "nl", label: "NL" },
  ];

  return (
    <div className="flex gap-4" role="group" aria-label="Language selector">
      {languages.map(({ code, label }) => {
        const isActive = locale === code;
        const isLoading = pendingLocale === code && isPending;

        const baseClasses =
          "font-sans cursor-pointer w-12 h-12 rounded-full transition-opacity focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-yellow";
        const stateClasses = isActive
          ? "bg-yellow text-black"
          : "bg-copygray text-white/80";
        const loadingClasses = isLoading ? "opacity-50" : "opacity-100";

        return (
          <button
            key={code}
            type="button"
            className={`${baseClasses} ${stateClasses} ${loadingClasses}`}
            onClick={() => handleSwitch(code)}
            aria-pressed={isActive}
            disabled={isLoading}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
};

export default LanguageSwitch;
