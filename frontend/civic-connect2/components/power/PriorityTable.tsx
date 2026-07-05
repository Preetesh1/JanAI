"use client";

import { PriorityRow } from "@/lib/api";
import { CATEGORY_META } from "@/lib/categoryMeta";
import { useLang } from "@/lib/i18n/LanguageContext";
import { Lock, ArrowUpRight } from "lucide-react";

export default function PriorityTable({ rows }: { rows: PriorityRow[] }) {
  const { t } = useLang();

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-line bg-slate-panel">
      <div className="grid grid-cols-[2.5rem_1fr_5rem] gap-3 border-b border-slate-line px-5 py-3 text-xs font-bold uppercase tracking-wide text-white/40 sm:grid-cols-[2.5rem_1fr_6rem_6rem_10rem]">
        <span>#</span>
        <span>{t.categories.Water.length ? "Sector" : "Sector"}</span>
        <span className="hidden sm:block">{t.citizenDemand}</span>
        <span className="hidden sm:block">{t.demographicDeficit}</span>
        <span>Score</span>
      </div>
      <ul>
        {rows.map((row, i) => {
          const meta = CATEGORY_META[row.category];
          const Icon = meta.icon;
          const isHold = row.metricsSource.masterPlanConflictFlag;
          return (
            <li
              key={row.category}
              className="grid grid-cols-[2.5rem_1fr_5rem] items-center gap-3 border-b border-slate-line px-5 py-4 last:border-none sm:grid-cols-[2.5rem_1fr_6rem_6rem_10rem]"
            >
              <span className="font-mono text-white/40">{String(i + 1).padStart(2, "0")}</span>
              <div className="flex items-center gap-3">
                <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${meta.color} ${meta.text}`}>
                  <Icon size={16} />
                </span>
                <div className="min-w-0">
                  <p className="truncate font-display font-bold text-white">{row.category}</p>
                  <p className="truncate text-xs text-white/40 sm:hidden">
                    {isHold ? t.holdOrder : t.executeOrder}
                  </p>
                </div>
              </div>
              <span className="hidden font-mono text-white/70 sm:block">
                {row.metricsSource.calculatedDemandWeight}
              </span>
              <span className="hidden font-mono text-white/70 sm:block">
                {row.metricsSource.censusDemographicDeficit}
              </span>
              <div className="flex items-center gap-2">
                <div className="h-1.5 w-16 overflow-hidden rounded-full bg-slate-line">
                  <div
                    className="h-full bg-marigold"
                    style={{ width: `${Math.min(100, row.compositeScore)}%` }}
                  />
                </div>
                <span className="font-mono text-lg font-bold text-white">{row.compositeScore}</span>
                {isHold ? (
                  <Lock size={14} className="text-clay" aria-label={t.holdOrder} />
                ) : (
                  <ArrowUpRight size={14} className="text-peacock" aria-label={t.executeOrder} />
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
