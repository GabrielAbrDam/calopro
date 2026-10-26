import type { ApplicationStatus, IncidentStatus } from "./types";

export const eur = (n: number) =>
  new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(n);

export const dateLong = (iso: string) =>
  new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "long", year: "numeric" }).format(new Date(iso));

export const dateShort = (iso: string) =>
  new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "short" }).format(new Date(iso));

export const dateTime = (iso: string) =>
  new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }).format(
    new Date(iso),
  );

export function todayIso() {
  const d = new Date();
  d.setHours(12, 0, 0, 0);
  return d.toISOString().slice(0, 10);
}

export function daysBetween(fromIso: string, toIso: string) {
  return Math.round((new Date(toIso).getTime() - new Date(fromIso).getTime()) / 86_400_000);
}

/** Durée en mois calendaires (arrondie au supérieur dès qu'un mois est entamé). */
export function monthsBetween(startIso: string, endIso: string) {
  const s = new Date(startIso);
  const e = new Date(endIso);
  let m = (e.getFullYear() - s.getFullYear()) * 12 + (e.getMonth() - s.getMonth());
  if (e.getDate() > s.getDate()) m += 1;
  return m;
}

// Règles du bail mobilité, codées en dur (PRD v2, cadre légal).
export const LEASE_RULES = {
  minMonths: 1,
  maxMonths: 10,
  motives: [
    "Formation professionnelle",
    "Études supérieures",
    "Contrat d'apprentissage",
    "Stage",
    "Engagement volontaire (service civique)",
    "Mutation professionnelle",
    "Mission temporaire",
  ],
  visaleUrl: "https://www.visale.fr/",
};

export function checkLeaseDates(start: string, end: string): string | null {
  if (!start || !end) return "Choisissez une date d'entrée et une date de sortie.";
  if (end <= start) return "La date de sortie doit être après la date d'entrée.";
  const months = monthsBetween(start, end);
  if (daysBetween(start, end) < 28) return "Le bail mobilité dure au moins 1 mois.";
  if (months > LEASE_RULES.maxMonths) return `Le bail mobilité dure 10 mois au plus (ici ${months} mois).`;
  return null;
}

export const applicationStatusLabel: Record<ApplicationStatus, string> = {
  recue: "Reçue",
  en_etude: "En étude",
  acceptee: "Acceptée",
  refusee: "Refusée",
};

export const incidentStatusLabel: Record<IncidentStatus, string> = {
  envoye: "Envoyé",
  pris_en_charge: "Pris en charge",
  resolu: "Résolu",
};

export const applicationStatusTone = { recue: "attention", en_etude: "info", acceptee: "ok", refusee: "neutre" } as const;
