"use client";

import Link from "next/link";
import { Settings2, Camera, PenLine } from "lucide-react";
import { useLang } from "@/lib/i18n/LanguageContext";
import LanguageToggle from "@/components/LanguageToggle";
import MicButton from "@/components/MicButton";
import CategoryTile from "@/components/CategoryTile";
import { PillLink } from "@/components/PillButton";
import { CATEGORY_LIST } from "@/lib/categoryMeta";
import { Category } from "@/lib/api";

export default function HomePage() {
  const { t, lang, speak } = useLang();

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col px-5 pt-6">
      {/* Top bar */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-extrabold leading-none">{t.appName}</h1>
          <p className="mt-1 text-sm font-medium text-ink/60">{t.tagline}</p>
        </div>
        <Link
          href="/power"
          aria-label={t.powerMode}
          className="flex h-11 w-11 items-center justify-center rounded-2xl border-[3px] border-ink bg-white text-ink shadow-hard-sm"
        >
          <Settings2 size={20} />
        </Link>
      </div>

      <div className="mt-4">
        <LanguageToggle />
      </div>

      {/* Hero: big mic */}
      <section className="mt-8 flex flex-col items-center rounded-blob border-[3px] border-ink bg-white py-10 shadow-hard">
        <Link
          href="/report?mode=voice"
          onClick={() => speak(t.tapToSpeak)}
          className="flex flex-col items-center gap-5"
        >
          <MicButton listening={false} onClick={() => {}} />
          <span className="max-w-[14rem] text-center font-display text-xl font-bold">
            {t.tapToSpeak}
          </span>
        </Link>

        <div className="mt-6 grid w-full max-w-xs grid-cols-2 gap-3">
          <PillLink href="/report?mode=photo" variant="accent" icon={Camera}>
            {t.takePhoto}
          </PillLink>
          <PillLink href="/report?mode=text" variant="light" icon={PenLine}>
            {t.typeInstead}
          </PillLink>
        </div>
      </section>

      {/* Categories */}
      <section className="mt-8">
        <h2 className="mb-3 font-display text-lg font-bold text-ink/80">{t.orChoose}</h2>
        <div className="grid grid-cols-3 gap-3">
          {CATEGORY_LIST.map((cat: Category) => (
            <Link key={cat} href={`/report?category=${cat}`} onClick={() => speak(t.categories[cat])}>
              <CategoryTile category={cat} label={t.categories[cat]} onSelect={() => {}} />
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
