import { Category } from "./api";
import { Droplets, Construction, Trash2, School, HeartPulse, Zap, LucideIcon } from "lucide-react";

export const CATEGORY_META: Record<
  Category,
  { color: string; text: string; icon: LucideIcon; emoji: string }
> = {
  Water: { color: "bg-peacock", text: "text-white", icon: Droplets, emoji: "💧" },
  Roads: { color: "bg-roadway", text: "text-ink", icon: Construction, emoji: "🚧" },
  Sanitation: { color: "bg-cobalt", text: "text-white", icon: Trash2, emoji: "🧹" },
  Education: { color: "bg-indigo", text: "text-white", icon: School, emoji: "🏫" },
  Health: { color: "bg-clay", text: "text-white", icon: HeartPulse, emoji: "🏥" },
  Electricity: { color: "bg-marigold", text: "text-ink", icon: Zap, emoji: "⚡" },
};

// Ordered so that two visually similar (warm) colors never sit side by side
// in a 3-column grid: row 1 is green / yellow / blue, row 2 is orange / indigo / red.
export const CATEGORY_LIST: Category[] = [
  "Water",
  "Electricity",
  "Sanitation",
  "Roads",
  "Education",
  "Health",
];
