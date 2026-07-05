"use client";

import { useEffect, useState } from "react";
import { Volume2, MapPin } from "lucide-react";
import { useLang } from "@/lib/i18n/LanguageContext";
import { getSubmissions, Submission } from "@/lib/api";
import { CATEGORY_META } from "@/lib/categoryMeta";

function urgencyLabel(score: number, t: any) {
  if (score >= 8) return { label: t.urgencyHigh, color: "bg-clay" };
  if (score >= 5) return { label: t.urgencyMed, color: "bg-marigold" };
  return { label: t.urgencyLow, color: "bg-peacock" };
}

export default function TrackPage() {
  const { t, speak } = useLang();
  const [subs, setSubs] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getSubmissions()
      .then((data) => setSubs(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="mx-auto min-h-dvh max-w-md px-5 pt-6">
      <h1 className="font-display text-2xl font-extrabold">{t.myReports}</h1>

      {loading && (
        <div className="mt-10 space-y-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-24 animate-pulse rounded-3xl border-[3px] border-ink/10 bg-ink/5" />
          ))}
        </div>
      )}

      {!loading && subs.length === 0 && (
        <div className="mt-16 flex flex-col items-center gap-2 text-center">
          <p className="font-display text-lg font-bold">{t.noReportsYet}</p>
          <p className="text-ink/60">{t.noReportsSub}</p>
        </div>
      )}

      <div className="mt-5 space-y-3 pb-10">
        {subs.map((s) => {
          const meta = CATEGORY_META[s.category];
          const Icon = meta.icon;
          const urgency = urgencyLabel(s.urgency_score, t);
          return (
            <div
              key={s.id}
              className="flex gap-3 rounded-3xl border-[3px] border-ink bg-white p-3 shadow-hard-sm"
            >
              <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ${meta.color} ${meta.text}`}>
                <Icon size={26} strokeWidth={2.25} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-display text-base font-bold">
                    {t.categories[s.category]}
                  </span>
                  <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-bold text-white ${urgency.color}`}>
                    {urgency.label}
                  </span>
                </div>
                <p className="mt-0.5 truncate text-sm text-ink/70">{s.summary}</p>
                <div className="mt-1 flex items-center gap-1 text-xs text-ink/50">
                  <MapPin size={12} /> <span className="truncate">{s.landmarks}</span>
                </div>
              </div>
              <button
                onClick={() => speak(`${t.categories[s.category]}. ${s.summary}`)}
                aria-label="Listen"
                className="flex h-9 w-9 shrink-0 items-center justify-center self-center rounded-xl bg-indigo text-white"
              >
                <Volume2 size={16} />
              </button>
            </div>
          );
        })}
      </div>
    </main>
  );
}
