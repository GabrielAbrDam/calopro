"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

// Barre de démonstration : passer d'un rôle à l'autre sans compte.
// En production (NEXT_PUBLIC_DEMO=0), elle disparaît.

type Role = "candidat" | "locataire" | "proprietaire";

function currentRole(path: string): Role {
  if (path.startsWith("/proprio")) return "proprietaire";
  if (path.startsWith("/sejour") || path.startsWith("/q/") || path.startsWith("/livret")) return "locataire";
  return "candidat";
}

export function RoleSwitcher({ tenantHref }: { tenantHref: string }) {
  const role = currentRole(usePathname());
  const roles: { key: Role; label: string; href: string }[] = [
    { key: "candidat", label: "Candidat", href: "/logements" },
    { key: "locataire", label: "Locataire", href: tenantHref },
    { key: "proprietaire", label: "Propriétaire", href: "/proprio" },
  ];

  return (
    <nav
      aria-label="Changer de rôle (démo)"
      className="no-print fixed inset-x-0 bottom-0 z-40 bg-granit pb-[env(safe-area-inset-bottom)] text-white"
    >
      <div className="mx-auto flex max-w-xl items-center gap-1 px-2 py-1.5">
        <span className="shrink-0 px-1.5 text-[0.7rem] font-semibold text-white/60">Voir en</span>
        {roles.map((r) => (
          <Link
            key={r.key}
            href={r.href}
            aria-current={role === r.key ? "page" : undefined}
            className={`flex min-h-10 flex-1 items-center justify-center rounded-full text-sm font-semibold transition-colors ${
              role === r.key ? "bg-balise text-granit" : "text-white/85 hover:bg-white/10"
            }`}
          >
            {r.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
