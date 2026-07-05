"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Mic, ClipboardList } from "lucide-react";
import { useLang } from "@/lib/i18n/LanguageContext";

export default function BottomNav() {
  const pathname = usePathname();
  const { t } = useLang();

  const items = [
    { href: "/", label: t.home, icon: Home },
    { href: "/report", label: t.report, icon: Mic },
    { href: "/track", label: t.track, icon: ClipboardList },
  ];

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t-[3px] border-ink bg-paper pb-[max(env(safe-area-inset-bottom),0.5rem)]"
      aria-label="Primary"
    >
      <ul className="mx-auto flex max-w-md items-stretch justify-around">
        {items.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                className="flex flex-col items-center gap-1 py-2.5 text-center"
              >
                <span
                  className={`flex h-11 w-11 items-center justify-center rounded-2xl transition-colors ${
                    active ? "bg-ink text-white" : "text-ink/60"
                  }`}
                >
                  <Icon size={24} strokeWidth={2.5} />
                </span>
                <span
                  className={`font-display text-sm font-bold ${
                    active ? "text-ink" : "text-ink/50"
                  }`}
                >
                  {label}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
