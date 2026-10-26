"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ROLE_BAR_HEIGHT } from "@/lib/demo";

export type Tab = { href: string; label: string; icon: React.ReactNode; exact?: boolean };

export function TabBar({ tabs }: { tabs: Tab[] }) {
  const path = usePathname();
  return (
    <nav
      aria-label="Navigation principale"
      style={{ bottom: ROLE_BAR_HEIGHT }}
      className={`no-print fixed inset-x-0 z-30 border-t border-trait bg-blanc/95 backdrop-blur ${ROLE_BAR_HEIGHT ? "" : "pb-[env(safe-area-inset-bottom)]"}`}
    >
      <ul className="mx-auto flex max-w-xl">
        {tabs.map((t) => {
          const active = t.exact ? path === t.href : path === t.href || path.startsWith(t.href + "/");
          return (
            <li key={t.href} className="flex-1">
              <Link
                href={t.href}
                aria-current={active ? "page" : undefined}
                className={`flex min-h-[60px] flex-col items-center justify-center gap-0.5 text-[0.72rem] font-semibold ${
                  active ? "text-emeraude" : "text-granit-doux"
                }`}
              >
                <span className={`rounded-full px-4 py-0.5 ${active ? "bg-emeraude-clair" : ""}`}>{t.icon}</span>
                {t.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
