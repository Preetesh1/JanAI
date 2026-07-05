"use client";

import { useLang } from "@/lib/i18n/LanguageContext";

export type Weights = { citizenDemand: number; demographicDeficit: number; infrastructureGap: number };

export default function WeightSliders({
  weights,
  onChange,
  onApply,
  loading,
}: {
  weights: Weights;
  onChange: (w: Weights) => void;
  onApply: () => void;
  loading?: boolean;
}) {
  const { t } = useLang();
  const total = weights.citizenDemand + weights.demographicDeficit + weights.infrastructureGap;

  const rows: { key: keyof Weights; label: string; color: string }[] = [
    { key: "citizenDemand", label: t.citizenDemand, color: "bg-marigold" },
    { key: "demographicDeficit", label: t.demographicDeficit, color: "bg-clay" },
    { key: "infrastructureGap", label: t.infrastructureGap, color: "bg-peacock" },
  ];

  function set(key: keyof Weights, value: number) {
    onChange({ ...weights, [key]: value });
  }

  return (
    <div className="rounded-2xl border border-slate-line bg-slate-panel p-5">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-display text-sm font-bold uppercase tracking-wide text-white/70">
          {t.weights}
        </h2>
        <span
          className={`font-mono text-sm ${total === 100 ? "text-peacock" : "text-clay"}`}
        >
          {total}/100
        </span>
      </div>

      <div className="space-y-5">
        {rows.map(({ key, label, color }) => (
          <div key={key}>
            <div className="mb-1.5 flex items-center justify-between text-sm text-white/80">
              <span>{label}</span>
              <span className="font-mono">{weights[key]}</span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              value={weights[key]}
              onChange={(e) => set(key, Number(e.target.value))}
              className={`h-2 w-full appearance-none rounded-full bg-slate-line accent-current [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white`}
              style={{ accentColor: undefined }}
            />
            <div className={`mt-1 h-1 rounded-full ${color}`} style={{ width: `${weights[key]}%` }} />
          </div>
        ))}
      </div>

      <button
        onClick={onApply}
        disabled={total !== 100 || loading}
        className="mt-5 w-full rounded-xl bg-marigold py-2.5 font-display text-sm font-bold text-ink transition-opacity disabled:opacity-30"
      >
        {loading ? "…" : t.applyWeights}
      </button>
    </div>
  );
}
