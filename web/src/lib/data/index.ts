import "server-only";
import { randomBytes } from "crypto";
import * as seed from "./seed";
import { hashToken } from "./seed";
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

// Couche d'accès aux données. Aujourd'hui : stockage en mémoire alimenté par seed.ts.
// Demain : mêmes signatures, implémentées avec Supabase (voir supabase/schema.sql).
// Les écrans n'appellent jamais autre chose que ces fonctions.

type Db = {
  properties: Property[];
  equipment: Equipment[];
  guideSections: GuideSection[];
  applications: Application[];
  stays: Stay[];
  stayDocuments: StayDocument[];
  incidents: Incident[];
};

const g = globalThis as unknown as { __caloproDb?: Db };

function db(): Db {
  if (!g.__caloproDb) {
    g.__caloproDb = structuredClone({
      properties: seed.properties,
      equipment: seed.equipment,
      guideSections: seed.guideSections,
      applications: seed.applications,
      stays: seed.stays,
      stayDocuments: seed.stayDocuments,
      incidents: seed.incidents,
    });
  }
  return g.__caloproDb;
}

export function newToken() {
  return randomBytes(32).toString("base64url");
}

function id(prefix: string) {
  return `${prefix}-${randomBytes(6).toString("hex")}`;
}

// ---------- Logements ----------

export async function listProperties() {
  return db().properties;
}

export async function getPropertyBySlug(slug: string) {
  return db().properties.find((p) => p.slug === slug) ?? null;
}

export async function getProperty(propertyId: string) {
  return db().properties.find((p) => p.id === propertyId) ?? null;
}

export async function updateProperty(propertyId: string, patch: Partial<Property>) {
  const p = db().properties.find((x) => x.id === propertyId);
  if (p) Object.assign(p, patch);
  return p ?? null;
}

/** Prochaine date libre : le lendemain du dernier séjour en cours ou à venir. */
export async function nextAvailableDate(propertyId: string) {
  const today = seed.day(0);
  const busy = db()
    .stays.filter((s) => s.property_id === propertyId && s.end_date >= today)
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
  return db().equipment.filter((e) => e.property_id === propertyId);
}

export async function getEquipmentBySlug(slug: string) {
  return db().equipment.find((e) => e.slug === slug) ?? null;
}

export async function getEquipment(equipmentId: string) {
  return db().equipment.find((e) => e.id === equipmentId) ?? null;
}

export async function listGuideSections(propertyId: string) {
  return db().guideSections.filter((s) => s.property_id === null || s.property_id === propertyId);
}

// ---------- Candidatures ----------

export async function listApplications(filter?: { propertyId?: string; status?: ApplicationStatus }) {
  return db()
    .applications.filter(
      (a) =>
        (!filter?.propertyId || a.property_id === filter.propertyId) &&
        (!filter?.status || a.status === filter.status),
    )
    .sort((a, b) => b.created_at.localeCompare(a.created_at));
}

export async function getApplication(applicationId: string) {
  return db().applications.find((a) => a.id === applicationId) ?? null;
}

/** Lecture côté candidat : uniquement par jeton (comparé haché). */
export async function getApplicationByToken(token: string) {
  const h = hashToken(token);
  return db().applications.find((a) => a.token_hash === h) ?? null;
}

export async function createApplication(
  input: Omit<Application, "id" | "owner_id" | "token_hash" | "created_at" | "status" | "history">,
) {
  const token = newToken();
  const now = new Date().toISOString();
  const app: Application = {
    ...input,
    id: id("a"),
    owner_id: seed.OWNER_ID,
    token_hash: hashToken(token),
    created_at: now,
    status: "recue",
    history: [{ at: now, status: "recue" }],
  };
  db().applications.push(app);
  return { application: app, token };
}

export async function setApplicationStatus(applicationId: string, status: ApplicationStatus) {
  const a = db().applications.find((x) => x.id === applicationId);
  if (!a || a.status === status) return a ?? null;
  a.status = status;
  a.history.push({ at: new Date().toISOString(), status });
  return a;
}

/** Candidatures ouvertes sur le même logement dont les dates chevauchent. */
export async function overlappingApplications(applicationId: string) {
  const a = await getApplication(applicationId);
  if (!a) return [];
  return db().applications.filter(
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
  return [...db().stays].sort((a, b) => a.start_date.localeCompare(b.start_date));
}

export async function getStay(stayId: string) {
  return db().stays.find((s) => s.id === stayId) ?? null;
}

/** Lecture côté locataire : jeton valide, non révoqué, et pas plus de 15 jours après la fin du bail. */
export async function getStayByToken(token: string) {
  const h = hashToken(token);
  const s = db().stays.find((x) => x.token_hash === h);
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
  db().stays.push(stay);
  return { stay, token };
}

export async function regenerateStayToken(stayId: string) {
  const s = db().stays.find((x) => x.id === stayId);
  if (!s) return null;
  const token = newToken();
  s.token_hash = hashToken(token);
  s.token_revoked = false;
  return token;
}

export async function toggleAnnex(stayId: string, annex: string) {
  const s = db().stays.find((x) => x.id === stayId);
  if (s) s.annexes[annex] = !s.annexes[annex];
}

export async function addArrivalPhotos(stayId: string, photos: { room: string; name: string }[]) {
  const s = db().stays.find((x) => x.id === stayId);
  if (!s) return;
  const now = new Date().toISOString();
  s.arrival_photos.push(...photos.map((p) => ({ ...p, at: now })));
}

export async function listStayDocuments(stayId: string) {
  return db().stayDocuments.filter((d) => d.stay_id === stayId);
}

export async function addStayDocument(stayId: string, kind: StayDocument["kind"], name: string) {
  db().stayDocuments.push({
    id: id("d"),
    owner_id: seed.OWNER_ID,
    stay_id: stayId,
    kind,
    name,
    uploaded_at: new Date().toISOString(),
  });
}

// ---------- Incidents ----------

export async function listIncidents(filter?: { propertyId?: string; stayId?: string }) {
  return db()
    .incidents.filter(
      (i) =>
        (!filter?.propertyId || i.property_id === filter.propertyId) &&
        (!filter?.stayId || i.stay_id === filter.stayId),
    )
    .sort((a, b) => b.created_at.localeCompare(a.created_at));
}

export async function createIncident(input: Omit<Incident, "id" | "owner_id" | "created_at" | "status">) {
  const incident: Incident = {
    ...input,
    id: id("i"),
    owner_id: seed.OWNER_ID,
    created_at: new Date().toISOString(),
    status: "envoye",
  };
  db().incidents.push(incident);
  return incident;
}

export async function setIncidentStatus(incidentId: string, status: IncidentStatus) {
  const i = db().incidents.find((x) => x.id === incidentId);
  if (i) i.status = status;
}

// ---------- Tableau de bord propriétaire ----------

export async function ownerAlerts() {
  const today = seed.day(0);
  const in7 = seed.day(7);
  const d = db();
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
