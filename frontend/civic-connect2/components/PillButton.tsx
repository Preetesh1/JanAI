import { LucideIcon } from "lucide-react";
import Link from "next/link";
import { ButtonHTMLAttributes } from "react";

type Variant = "light" | "dark" | "accent" | "success" | "marigold";

const VARIANT_CLASSES: Record<Variant, string> = {
  light: "bg-white text-ink",
  dark: "bg-ink text-white",
  accent: "bg-cobalt text-white",
  success: "bg-peacock text-white",
  marigold: "bg-marigold text-ink",
};

const base =
  "flex h-12 w-full items-center justify-center gap-2 rounded-full border-[3px] border-ink px-4 font-display text-sm font-bold shadow-hard-sm transition-transform active:translate-x-[2px] active:translate-y-[2px] active:shadow-none disabled:opacity-40";

export function PillButton({
  icon: Icon,
  children,
  variant = "light",
  className = "",
  ...props
}: {
  icon?: LucideIcon;
  children: React.ReactNode;
  variant?: Variant;
} & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button className={`${base} ${VARIANT_CLASSES[variant]} ${className}`} {...props}>
      {Icon && <Icon size={18} strokeWidth={2.5} />}
      <span className="truncate">{children}</span>
    </button>
  );
}

export function PillLink({
  icon: Icon,
  children,
  variant = "light",
  href,
  onClick,
  className = "",
}: {
  icon?: LucideIcon;
  children: React.ReactNode;
  variant?: Variant;
  href: string;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <Link href={href} onClick={onClick} className={`${base} ${VARIANT_CLASSES[variant]} ${className}`}>
      {Icon && <Icon size={18} strokeWidth={2.5} />}
      <span className="truncate">{children}</span>
    </Link>
  );
}
