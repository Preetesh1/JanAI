"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, RefreshCcw } from "lucide-react";
import { useLang } from "@/lib/i18n/LanguageContext";
import { getHotspots, getSubmissions, prioritize, Hotspot, PriorityRow, Submission } from "@/lib/api";
import WeightSliders, { Weights } from "@/components/power/WeightSliders";
import PriorityTable from "@/components/power/PriorityTable";
import HotspotList from "@/components/power/HotspotList";

const DEFAULT_WEIGHTS: Weights = { citizenDemand: 40, demographicDeficit: 30, infrastructureGap: 30 };

export default function PowerModePage() {
  const { t } = useLang();
  const [weights, setWeights] = useState<Weights>(DEFAULT_WEIGHTS);
  const [rows, setRows] = useState<PriorityRow[]>([]);
  const [hotspots, setHotspots] = useState<Hotspot[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);

  async function refresh(w: Weights = weights) {
    setLoading(true);
    const [p, h, s] = await Promise.all([prioritize(w), getHotspots(), getSubmissions()]);
    setRows(p.ranked_priority_matrix);
    setHotspots(h.map_hotspots);
    setSubmissions(Array.isArray(s) ? s : []);
    setLoading(false);
  }

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const critical = submissions.filter((s) => s.urgency_score >= 8).length;

  return (
    <div className="min-h-dvh bg-slate-bg text-white">
      <header className="sticky top-0 z-10 border-b border-slate-line bg-slate-bg/95 px-5 py-4 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-line text-white/70 hover:text-white"
              aria-label={t.exitPowerMode}
            >
              <ArrowLeft size={16} />
            </Link>
            <div>
              <h1 className="font-display text-lg font-extrabold leading-none">{t.dashboardTitle}</h1>
              <p className="text-xs text-white/40">{t.dashboardSub}</p>
            </div>
          </div>
          <button
            onClick={() => refresh()}
            className="flex items-center gap-1.5 rounded-lg border border-slate-line px-3 py-1.5 text-xs font-bold text-white/70 hover:text-white"
          >
            <RefreshCcw size={12} className={loading ? "animate-spin" : ""} /> Sync
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-5xl space-y-5 px-5 py-6">
        {/* Stat strip */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Total reports", value: submissions.length },
            { label: t.critical, value: critical },
            { label: "Sectors tracked", value: Object.keys(rows).length || 6 },
          ].map((stat) => (
            <div key={stat.label} className="rounded-2xl border border-slate-line bg-slate-panel p-4">
              <p className="font-mono text-3xl font-bold text-marigold">{stat.value}</p>
              <p className="mt-1 text-xs uppercase tracking-wide text-white/40">{stat.label}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_20rem]">
          <PriorityTable rows={rows} />
          <div className="space-y-5">
            <WeightSliders weights={weights} onChange={setWeights} onApply={() => refresh(weights)} loading={loading} />
            <HotspotList hotspots={hotspots} />
          </div>
        </div>
      </main>
    </div>
  );
}
