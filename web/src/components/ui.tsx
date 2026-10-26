import Link from "next/link";
import type { DpeLabel, Video } from "@/lib/types";
import { IconArrowLeft, IconPhone } from "./icons";
import { VideoBlock } from "./video-block";

export function PageHeader({
  title,
  kicker,
  back,
  children,
}: {
  title: string;
  kicker?: string;
  back?: { href: string; label: string };
  children?: React.ReactNode;
}) {
  return (
    <header className="px-4 pt-6 pb-4">
      {back && (
        <Link href={back.href} className="no-print -ml-2 mb-3 inline-flex min-h-11 items-center gap-1.5 rounded-full px-2 text-sm font-semibold text-granit-doux hover:text-granit">
          <IconArrowLeft className="size-5" /> {back.label}
        </Link>
      )}
      {kicker && <p className="mb-1 text-sm font-medium text-emeraude">{kicker}</p>}
      <h1 className="titre text-[2.4rem] text-granit">{title}</h1>
      {children && <div className="mt-2 text-granit-doux">{children}</div>}
    </header>
  );
}

export function Page({ children, withTabs = true }: { children: React.ReactNode; withTabs?: boolean }) {
  return <main className={`mx-auto min-h-dvh max-w-xl ${withTabs ? "pb-40" : "pb-24"}`}>{children}</main>;
}

export function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <section className={`rounded-2xl bg-blanc p-4 ${className}`}>{children}</section>;
}

/** Photo du logement ; à défaut, un aplat aux couleurs du lieu, étiqueté par pièce. */
export function PhotoTile({ room, tone, src, className = "" }: { room: string; tone: string; src?: string; className?: string }) {
  if (src)
    return (
      <div className={`relative flex items-end overflow-hidden rounded-xl bg-sable ${className}`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt={room || "Photo du logement"} loading="lazy" className="absolute inset-0 size-full object-cover" />
        {room && <span className="relative m-2 rounded-full bg-granit/70 px-2.5 py-1 text-xs font-medium text-white">{room}</span>}
      </div>
    );
  return (
    <div
      className={`relative flex items-end overflow-hidden rounded-xl ${className}`}
      style={{ background: `linear-gradient(160deg, ${tone} 0%, color-mix(in srgb, ${tone} 70%, #22303a) 100%)` }}
      role="img"
      aria-label={`Photo : ${room}`}
    >
      <svg viewBox="0 0 100 40" className="absolute inset-x-0 bottom-0 w-full opacity-20" preserveAspectRatio="none" aria-hidden>
        <path d="M0 25 Q 12 18 25 25 T 50 25 T 75 25 T 100 25 V40 H0z" fill="white" />
      </svg>
      <span className="relative m-2 rounded-full bg-granit/70 px-2.5 py-1 text-xs font-medium text-white">{room}</span>
    </div>
  );
}

const dpeColors: Record<DpeLabel, string> = {
  A: "#009c6d",
  B: "#52b153",
  C: "#a5cc74",
  D: "#f4e70f",
  E: "#f0b50f",
  F: "#eb8235",
  G: "#d7221f",
};

export function DpeScale({ label, conso }: { label: DpeLabel; conso?: number }) {
  return (
    <div>
      <div className="flex gap-1" role="img" aria-label={`Étiquette énergie ${label}`}>
        {(Object.keys(dpeColors) as DpeLabel[]).map((l) => (
          <span
            key={l}
            className={`flex flex-1 items-center justify-center rounded-md font-bold transition-all ${
              l === label ? "h-10 text-base text-granit shadow-[0_0_0_2px_#22303a]" : "h-7 self-end text-xs text-granit/70"
            }`}
            style={{ background: dpeColors[l] }}
          >
            {l}
          </span>
        ))}
      </div>
      {conso && <p className="mt-2 text-sm text-granit-doux">{conso} kWh/m²/an en énergie primaire</p>}
    </div>
  );
}

const pillTones = {
  neutre: "bg-sable text-granit",
  info: "bg-emeraude-clair text-emeraude-fonce",
  ok: "bg-emeraude text-white",
  attention: "bg-balise-clair text-granit",
  alerte: "bg-alerte-clair text-alerte",
};

export function Pill({ tone = "neutre", children }: { tone?: keyof typeof pillTones; children: React.ReactNode }) {
  return <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${pillTones[tone]}`}>{children}</span>;
}

export function MapEmbed({ lat, lng, label }: { lat: number; lng: number; label: string }) {
  const d = 0.006;
  const bbox = [lng - d * 1.6, lat - d, lng + d * 1.6, lat + d].join(",");
  return (
    <iframe
      title={`Carte : ${label}`}
      className="h-56 w-full rounded-xl border-0"
      loading="lazy"
      src={`https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat},${lng}`}
    />
  );
}

export function RelayCard({ name, role, phone }: { name: string; role: string; phone: string }) {
  return (
    <a
      href={`tel:${phone.replace(/\s/g, "")}`}
      className="flex items-center gap-3 rounded-2xl bg-emeraude p-4 text-white hover:bg-emeraude-fonce"
    >
      <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-white/15">
        <IconPhone />
      </span>
      <span className="flex-1">
        <span className="block font-semibold">{name}</span>
        <span className="block text-sm text-white/80">{role}</span>
      </span>
      <span className="text-sm font-semibold tabular-nums">{phone}</span>
    </a>
  );
}

export function Notice({ steps, video }: { steps: string[]; video: Video }) {
  return (
    <div className="space-y-4">
      {video && <VideoBlock video={video} />}
      <ol className="space-y-3">
        {steps.map((s, i) => (
          <li key={i} className="flex gap-3">
            <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-emeraude-clair text-sm font-bold text-emeraude-fonce">
              {i + 1}
            </span>
            <p className="pt-0.5 leading-relaxed">{s}</p>
          </li>
        ))}
      </ol>
    </div>
  );
}

export function DemoBanner({ children }: { children: React.ReactNode }) {
  return (
    <div className="no-print bg-balise-clair px-4 py-2 text-center text-xs text-granit">
      {children}
    </div>
  );
}
