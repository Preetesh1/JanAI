"use client";

import { useLang } from "@/lib/i18n/LanguageContext";

export default function LanguageToggle() {
  const { lang, setLang } = useLang();

  return (
    <div
      role="group"
      aria-label="Language"
      className="inline-flex rounded-full border-[3px] border-ink bg-white p-1 shadow-hard-sm"
    >
      <button
        onClick={() => setLang("hi")}
        className={`rounded-full px-4 py-1.5 text-base font-display font-bold transition-colors ${
          lang === "hi" ? "bg-ink text-white" : "text-ink"
        }`}
        aria-pressed={lang === "hi"}
      >
        हिं
      </button>
      <button
        onClick={() => setLang("en")}
        className={`rounded-full px-4 py-1.5 text-base font-display font-bold transition-colors ${
          lang === "en" ? "bg-ink text-white" : "text-ink"
        }`}
        aria-pressed={lang === "en"}
      >
        EN
      </button>
    </div>
  );
}
