"use client";

import { Hotspot } from "@/lib/api";
import { CATEGORY_META } from "@/lib/categoryMeta";
import { useLang } from "@/lib/i18n/LanguageContext";

export default function HotspotList({ hotspots }: { hotspots: Hotspot[] }) {
  const { t } = useLang();

  return (
    <div className="rounded-2xl border border-slate-line bg-slate-panel p-5">
      <h2 className="mb-4 font-display text-sm font-bold uppercase tracking-wide text-white/70">
        {t.hotspotsTitle}
      </h2>
      <div className="space-y-3">
        {hotspots.map((h) => {
          const meta = CATEGORY_META[h.category];
          const Icon = meta.icon;
          return (
            <div key={h.category} className="flex items-center gap-3">
              <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${meta.color} ${meta.text}`}>
                <Icon size={16} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate font-display text-sm font-bold text-white">{h.category}</p>
                <p className="font-mono text-xs text-white/40">
                  {h.center_mass_coordinates.lat.toFixed(3)}, {h.center_mass_coordinates.lng.toFixed(3)}
                </p>
              </div>
              <div className="text-right">
                <p className="font-mono text-sm text-white">
                  {h.report_count} <span className="text-white/40">{t.reports}</span>
                </p>
                {h.critical_incident_count > 0 && (
                  <p className="font-mono text-xs text-clay">
                    {h.critical_incident_count} {t.critical}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
