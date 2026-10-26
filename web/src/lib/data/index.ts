import "server-only";
import { randomBytes } from "crypto";
import { cache } from "react";
import { cookies } from "next/headers";
import * as seed from "./seed";
import { hashToken } from "./seed";
import { DEMO } from "../demo";
import type {
  Application,
  ApplicationStatus,
  Equipment,
  GuideSection,
  Incident,
  IncidentStatus,
  Property,
  Stay,
  StayDocument,
} from "../types";

// Couche d'accès aux données. Les écrans n'appellent jamais autre chose que ces fonctions.
//
// MVP démo : données de seed.ts + les actions du visiteur, rejouées depuis un cookie.
// Chaque visiteur a donc son propre bac à sable, qui fonctionne aussi en serverless (Netlify).
// Demain : mêmes signatures, implémentées avec Supabase (voir supabase/schema.sql).

type Db = {
  properties: Property[];
  equipment: Equipment[];
  guideSections: GuideSection[];
  applications: Application[];
  stays: Stay[];
  stayDocuments: StayDocument[];
  incidents: Incident[];
};

type Event =
  | { k: "prop"; id: string; patch: Partial<Property> }
  | { k: "app"; app: Application }
  | { k: "appStatus"; id: string; status: ApplicationStatus; at: string }
  | { k: "stay"; stay: Stay }
  | { k: "token"; id: string; hash: string }
  | { k: "annex"; id: string; annex: string }
  | { k: "photos"; id: string; photos: Stay["arrival_photos"] }
  | { k: "doc"; doc: StayDocument }
  | { k: "incident"; incident: Incident }
  | { k: "incidentStatus"; id: string; status: IncidentStatus };

const COOKIE = "calopro_demo";
const MAX_COOKIE = 3800;

function apply(d: Db, e: Event) {
  switch (e.k) {
    case "prop": {
      const p = d.properties.find((x) => x.id === e.id);
      if (p) Object.assign(p, e.patch);
      break;
    }
    case "app":
      d.applications.push(e.app);
      break;
    case "appStatus": {
      const a = d.applications.find((x) => x.id === e.id);
      if (a && a.status !== e.status) {
        a.status = e.status;
        a.history.push({ at: e.at, status: e.status });
      }
      break;
    }
    case "stay":
      d.stays.push(e.stay);
      break;
    case "token": {
      const s = d.stays.find((x) => x.id === e.id);
      if (s) {
        s.token_hash = e.hash;
        s.token_revoked = false;
      }
      break;
    }
    case "annex": {
      const s = d.stays.find((x) => x.id === e.id);
      if (s) s.annexes[e.annex] = !s.annexes[e.annex];
      break;
    }
    case "photos":
      d.stays.find((x) => x.id === e.id)?.arrival_photos.push(...e.photos);
      break;
    case "doc":
      d.stayDocuments.push(e.doc);
      break;
    case "incident":
      d.incidents.push(e.incident);
      break;
    case "incidentStatus": {
      const i = d.incidents.find((x) => x.id === e.id);
      if (i) i.status = e.status;
      break;
    }
  }
}

function seedDb(): Db {
  return structuredClone({
    properties: seed.properties,
    equipment: seed.equipment,
    guideSections: seed.guideSections,
    applications: seed.applications,
    stays: seed.stays,
    stayDocuments: seed.stayDocuments,
    incidents: seed.incidents,
  });
}

/** Une fois par requête : seed + événements du visiteur. */
const load = cache(async () => {
  const d = seedDb();
  let events: Event[] = [];
  try {
    const raw = (await cookies()).get(COOKIE)?.value;
    if (raw) events = JSON.parse(Buffer.from(raw, "base64url").toString("utf8"));
  } catch {
    events = [];
  }
  for (const e of events) apply(d, e);
  return { d, events };
});

async function db() {
  return (await load()).d;
}

/** Applique une écriture et la mémorise dans le cookie du visiteur (server actions uniquement). */
async function commit(e: Event) {
  const s = await load();
  apply(s.d, e);
  s.events.push(e);
  let encoded = Buffer.from(JSON.stringify(s.events)).toString("base64url");
  // Cookie limité à ~4 Ko : on oublie les plus anciennes actions si besoin.
  while (encoded.length > MAX_COOKIE && s.events.length > 1) {
    s.events.shift();
    encoded = Buffer.from(JSON.stringify(s.events)).toString("base64url");
  }
  (await cookies()).set(COOKIE, encoded, { httpOnly: true, sameSite: "lax", path: "/", maxAge: 60 * 60 * 24 * 30 });
}

export async function resetDemo() {
  (await cookies()).delete(COOKIE);
}

const clip = (s: string, n = 280) => (s.length > n ? s.slice(0, n) + "…" : s);

export function newToken() {
  return randomBytes(32).toString("base64url");
}

function id(prefix: string) {
  return `${prefix}-${randomBytes(5).toString("hex")}`;
}

// Jetons de démo : toujours valides, même après « régénérer le lien ».
const DEMO_TOKEN_TARGETS: Record<string, string> = {
  [seed.DEMO_TOKENS.stayCorsaire]: "s-lea",
  [seed.DEMO_TOKENS.stayRocabey]: "s-thomas",
  [seed.DEMO_TOKENS.appCamille]: "a-camille",
  [seed.DEMO_TOKENS.appJulien]: "a-julien",
  [seed.DEMO_TOKENS.appInes]: "a-ines",
  [seed.DEMO_TOKENS.appMarc]: "a-marc",
  [seed.DEMO_TOKENS.appThomas]: "a-thomas",
};

// ---------- Logements ----------

export async function listProperties() {
  return (await db()).properties;
}

export async function getPropertyBySlug(slug: string) {
  return (await db()).properties.find((p) => p.slug === slug) ?? null;
}

export async function getProperty(propertyId: string) {
  return (await db()).properties.find((p) => p.id === propertyId) ?? null;
}

export async function updateProperty(propertyId: string, patch: Partial<Property>) {
  if (patch.description) patch.description = clip(patch.description, 600);
  await commit({ k: "prop", id: propertyId, patch });
  return getProperty(propertyId);
}

/** Prochaine date libre : le lendemain du dernier séjour en cours ou à venir. */
export async function nextAvailableDate(propertyId: string) {
  const today = seed.day(0);
  const busy = (await db()).stays
    .filter((s) => s.property_id === propertyId && s.end_date >= today)
    .sort((a, b) => a.start_date.localeCompare(b.start_date));
  let free = today;
  for (const s of busy) {
    if (s.start_date <= free) {
      const after = new Date(s.end_date);
      after.setDate(after.getDate() + 1);
      free = after.toISOString().slice(0, 10);
    }
  }
  return free;
}

// ---------- Équipements et livret ----------

export async function listEquipment(propertyId: string) {
  return (await db()).equipment.filter((e) => e.property_id === propertyId);
}

export async function getEquipmentBySlug(slug: string) {
  return (await db()).equipment.find((e) => e.slug === slug) ?? null;
}

export async function getEquipment(equipmentId: string) {
  return (await db()).equipment.find((e) => e.id === equipmentId) ?? null;
}

export async function listGuideSections(propertyId: string) {
  return (await db()).guideSections.filter((s) => s.property_id === null || s.property_id === propertyId);
}

// ---------- Candidatures ----------

export async function listApplications(filter?: { propertyId?: string; status?: ApplicationStatus }) {
  return (await db()).applications
    .filter(
      (a) =>
        (!filter?.propertyId || a.property_id === filter.propertyId) &&
        (!filter?.status || a.status === filter.status),
    )
    .sort((a, b) => b.created_at.localeCompare(a.created_at));
}

export async function getApplication(applicationId: string) {
  return (await db()).applications.find((a) => a.id === applicationId) ?? null;
}

/** Lecture côté candidat : uniquement par jeton (comparé haché). */
export async function getApplicationByToken(token: string) {
  const d = await db();
  if (DEMO && DEMO_TOKEN_TARGETS[token]) return d.applications.find((a) => a.id === DEMO_TOKEN_TARGETS[token]) ?? null;
  const h = hashToken(token);
  return d.applications.find((a) => a.token_hash === h) ?? null;
}

export async function createApplication(
  input: Omit<Application, "id" | "owner_id" | "token_hash" | "created_at" | "status" | "history">,
) {
  const token = newToken();
  const now = new Date().toISOString();
  const app: Application = {
    ...input,
    message: clip(input.message),
    files: input.files.slice(0, 5).map((f) => ({ name: clip(f.name, 60), size: f.size })),
    id: id("a"),
    owner_id: seed.OWNER_ID,
    token_hash: hashToken(token),
    created_at: now,
    status: "recue",
    history: [{ at: now, status: "recue" }],
  };
  await commit({ k: "app", app });
  return { application: app, token };
}

export async function setApplicationStatus(applicationId: string, status: ApplicationStatus) {
  const a = await getApplication(applicationId);
  if (!a || a.status === status) return a;
  await commit({ k: "appStatus", id: applicationId, status, at: new Date().toISOString() });
  return a;
}

/** Candidatures ouvertes sur le même logement dont les dates chevauchent. */
export async function overlappingApplications(applicationId: string) {
  const a = await getApplication(applicationId);
  if (!a) return [];
  return (await db()).applications.filter(
    (o) =>
      o.id !== a.id &&
      o.property_id === a.property_id &&
      (o.status === "recue" || o.status === "en_etude") &&
      o.start_date <= a.end_date &&
      o.end_date >= a.start_date,
  );
}

// ---------- Séjours ----------

export async function listStays() {
  return [...(await db()).stays].sort((a, b) => a.start_date.localeCompare(b.start_date));
}

export async function getStay(stayId: string) {
  return (await db()).stays.find((s) => s.id === stayId) ?? null;
}

/** Lecture côté locataire : jeton valide, non révoqué, et pas plus de 15 jours après la fin du bail. */
export async function getStayByToken(token: string) {
  const d = await db();
  if (DEMO && DEMO_TOKEN_TARGETS[token]) return d.stays.find((s) => s.id === DEMO_TOKEN_TARGETS[token]) ?? null;
  const h = hashToken(token);
  const s = d.stays.find((x) => x.token_hash === h);
  if (!s || s.token_revoked) return null;
  const limit = new Date(s.end_date);
  limit.setDate(limit.getDate() + 15);
  if (new Date() > limit) return null;
  return s;
}

export async function createStay(input: Omit<Stay, "id" | "owner_id" | "token_hash" | "token_revoked" | "arrival_photos">) {
  const token = newToken();
  const stay: Stay = {
    ...input,
    id: id("s"),
    owner_id: seed.OWNER_ID,
    token_hash: hashToken(token),
    token_revoked: false,
    arrival_photos: [],
  };
  await commit({ k: "stay", stay });
  return { stay, token };
}

export async function regenerateStayToken(stayId: string) {
  if (!(await getStay(stayId))) return null;
  const token = newToken();
  await commit({ k: "token", id: stayId, hash: hashToken(token) });
  return token;
}

export async function toggleAnnex(stayId: string, annex: string) {
  await commit({ k: "annex", id: stayId, annex });
}

export async function addArrivalPhotos(stayId: string, photos: { room: string; name: string }[]) {
  const now = new Date().toISOString();
  await commit({ k: "photos", id: stayId, photos: photos.slice(0, 6).map((p) => ({ room: p.room, name: clip(p.name, 50), at: now })) });
}

export async function listStayDocuments(stayId: string) {
  return (await db()).stayDocuments.filter((d) => d.stay_id === stayId);
}

export async function addStayDocument(stayId: string, kind: StayDocument["kind"], name: string) {
  await commit({
    k: "doc",
    doc: { id: id("d"), owner_id: seed.OWNER_ID, stay_id: stayId, kind, name: clip(name, 60), uploaded_at: new Date().toISOString() },
  });
}

// ---------- Incidents ----------

export async function listIncidents(filter?: { propertyId?: string; stayId?: string }) {
  return (await db()).incidents
    .filter(
      (i) =>
        (!filter?.propertyId || i.property_id === filter.propertyId) &&
        (!filter?.stayId || i.stay_id === filter.stayId),
    )
    .sort((a, b) => b.created_at.localeCompare(a.created_at));
}

export async function createIncident(input: Omit<Incident, "id" | "owner_id" | "created_at" | "status">) {
  const incident: Incident = {
    ...input,
    description: clip(input.description),
    id: id("i"),
    owner_id: seed.OWNER_ID,
    created_at: new Date().toISOString(),
    status: "envoye",
  };
  await commit({ k: "incident", incident });
  return incident;
}

export async function setIncidentStatus(incidentId: string, status: IncidentStatus) {
  await commit({ k: "incidentStatus", id: incidentId, status });
}

// ---------- Tableau de bord propriétaire ----------

export async function ownerAlerts() {
  const today = seed.day(0);
  const in7 = seed.day(7);
  const d = await db();
  const name = (pid: string) => d.properties.find((p) => p.id === pid)?.name ?? "";
  const alerts: { kind: "candidature" | "incident" | "entree" | "sortie" | "dpe"; title: string; detail: string; href: string; urgent?: boolean }[] = [];

  for (const i of d.incidents.filter((x) => x.status !== "resolu")) {
    alerts.push({
      kind: "incident",
      title: `Incident ${i.status === "envoye" ? "à prendre en charge" : "en cours"} · ${name(i.property_id)}`,
      detail: i.description,
      href: `/proprio/sejours#incidents`,
      urgent: i.urgency === "urgente" || i.status === "envoye",
    });
  }
  for (const a of d.applications.filter((x) => x.status === "recue")) {
    alerts.push({
      kind: "candidature",
      title: `Candidature reçue · ${name(a.property_id)}`,
      detail: `${a.first_name} ${a.last_name}, ${a.motive.toLowerCase()}`,
      href: `/proprio/candidatures/${a.id}`,
    });
  }
  for (const s of d.stays) {
    if (s.start_date >= today && s.start_date <= in7)
      alerts.push({
        kind: "entree",
        title: `Entrée ${s.start_date === today ? "aujourd'hui" : "le " + s.start_date} · ${name(s.property_id)}`,
        detail: s.tenant_name,
        href: `/proprio/sejours/${s.id}`,
      });
    if (s.end_date >= today && s.end_date <= in7)
      alerts.push({
        kind: "sortie",
        title: `Sortie le ${s.end_date} · ${name(s.property_id)}`,
        detail: s.tenant_name,
        href: `/proprio/sejours/${s.id}`,
      });
  }
  for (const p of d.properties.filter((x) => x.dpe.label === "F" || x.dpe.label === "G"))
    alerts.push({
      kind: "dpe",
      title: `DPE ${p.dpe.label} · ${p.name}`,
      detail:
        p.dpe.label === "G"
          ? "Location interdite depuis 2025 pour un nouveau bail."
          : "Location interdite à partir de 2028 : prévoir des travaux.",
      href: `/proprio/logements/${p.id}`,
    });
  return alerts;
}

export { RELAY_CONTACT, OWNER_CONTACT, DEMO_TOKENS } from "./seed";
