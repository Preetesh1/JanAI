"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { Lang, translations } from "./translations";

type Ctx = {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (typeof translations)[Lang];
  speak: (text: string) => void;
};

const LanguageContext = createContext<Ctx | null>(null);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>("hi");

  useEffect(() => {
    const stored = typeof window !== "undefined" ? window.localStorage.getItem("aa-lang") : null;
    if (stored === "en" || stored === "hi") setLangState(stored);
  }, []);

  const setLang = (l: Lang) => {
    setLangState(l);
    if (typeof window !== "undefined") window.localStorage.setItem("aa-lang", l);
  };

  const speak = (text: string) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = lang === "hi" ? "hi-IN" : "en-IN";
    utter.rate = 0.95;
    window.speechSynthesis.speak(utter);
  };

  const value = useMemo(
    () => ({ lang, setLang, t: translations[lang], speak }),
    [lang]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLang() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLang must be used within LanguageProvider");
  return ctx;
}
