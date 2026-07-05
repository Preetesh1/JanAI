"use client";

import { Category } from "@/lib/api";
import { CATEGORY_META } from "@/lib/categoryMeta";

export default function CategoryTile({
  category,
  label,
  onSelect,
  selected,
}: {
  category: Category;
  label: string;
  onSelect: (c: Category) => void;
  selected?: boolean;
}) {
  const meta = CATEGORY_META[category];
  const Icon = meta.icon;

  return (
    <button
      onClick={() => onSelect(category)}
      className={`flex flex-col items-center justify-center gap-2 rounded-3xl border-[3px] border-ink ${meta.color} ${meta.text} aspect-square p-3 shadow-hard-sm transition-transform active:translate-x-[2px] active:translate-y-[2px] active:shadow-none ${
        selected ? "ring-4 ring-ink ring-offset-2 ring-offset-paper" : ""
      }`}
    >
      <Icon size={30} strokeWidth={2.25} />
      <span className="font-display text-base font-bold leading-tight text-center">
        {label}
      </span>
    </button>
  );
}
