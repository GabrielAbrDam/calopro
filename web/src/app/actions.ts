"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import * as data from "@/lib/data";
import { checkLeaseDates, LEASE_RULES, applicationStatusLabel } from "@/lib/format";
import { findDpe, geocode } from "@/lib/gouv";
import { baseUrl, sendMail } from "@/lib/mail";
import type { ApplicationStatus, IncidentStatus, StayDocument } from "@/lib/types";
import { DEMO } from "@/lib/demo";

// ---------- Public ----------
// En démo (DEMO), un champ vide prend une valeur par défaut : rien ne bloque la visite.

export type ResendState = { message: string; link?: string } | null;

export async function resendStayLink(_prev: ResendState, form: FormData): Promise<ResendState> {
  const email = String(form.get("email") ?? "").trim().toLowerCase();
  const stays = await data.listStays();
  const stay = stays.find((s) => s.tenant_email.toLowerCase() === email && !s.token_revoked);
  if (stay) {
    const token = await data.regenerateStayToken(stay.id);
    await sendMail(email, "Votre lien « Mon séjour »", `Votre nouveau lien : ${baseUrl()}/sejour/${token}\nL'ancien lien ne fonctionne plus.`);
  }
  // Même réponse dans tous les cas : on ne révèle pas qui est locataire.
  const message = "Si cette adresse correspond à un bail en cours, un nouveau lien vient de partir. Pensez à vérifier vos indésirables.";
  return DEMO ? { message, link: `/sejour/${data.DEMO_TOKENS.stayCorsaire}` } : { message };
}

export type ApplyState = { error?: string } | null;

function addMonths(iso: string, months: number) {
  const d = new Date(iso);
  d.setMonth(d.getMonth() + months);
  return d.toISOString().slice(0, 10);
}

export async function submitApplication(_prev: ApplyState, form: FormData): Promise<ApplyState> {
  const raw = (k: string) => String(form.get(k) ?? "").trim();
  const property = await data.getPropertyBySlug(raw("property"));
  if (!property) return { error: "Logement introuvable." };

  const free = await data.nextAvailableDate(property.id);
  const defaults: Record<string, string> = DEMO
    ? {
        start_date: free,
        end_date: addMonths(raw("start_date") || free, 4),
        motive: "Mission temporaire",
        first_name: "Alex",
        last_name: "Martin",
        email: "alex.martin@exemple.fr",
        phone: "06 12 34 56 78",
        dossier_facile_url: "https://locataire.dossierfacile.logement.gouv.fr/file/demo-alex",
      }
    : {};
  const get = (k: string) => raw(k) || defaults[k] || "";

  const dateError = checkLeaseDates(get("start_date"), get("end_date"));
  if (dateError) return { error: dateError };
  if (!LEASE_RULES.motives.includes(get("motive"))) return { error: "Choisissez le motif de votre bail mobilité." };
  if (!DEMO && form.get("consent") !== "on") return { error: "Cochez le consentement pour envoyer votre dossier." };

  const files = form.getAll("files").filter((f): f is File => f instanceof File && f.size > 0);
  const dfUrl = raw("dossier_facile_url") || (files.length ? "" : defaults.dossier_facile_url ?? "");
  if (!dfUrl && files.length === 0) return { error: "Ajoutez votre lien DossierFacile ou au moins une pièce." };
  if (dfUrl && !DEMO && !/^https:\/\/([a-z0-9-]+\.)*dossierfacile\.(logement\.gouv\.)?fr\//.test(dfUrl))
    return { error: "Le lien doit venir de dossierfacile.logement.gouv.fr." };
  const tooBig = files.find((f) => f.size > 10 * 1024 * 1024);
  if (tooBig) return { error: `« ${tooBig.name} » dépasse 10 Mo.` };

  const { application, token } = await data.createApplication({
    property_id: property.id,
    first_name: get("first_name"),
    last_name: get("last_name"),
    email: get("email"),
    phone: get("phone"),
    start_date: get("start_date"),
    end_date: get("end_date"),
    motive: get("motive"),
    dossier_facile_url: dfUrl || null,
    files: files.map((f) => ({ name: f.name, size: f.size })),
    message: raw("message"),
  });

  await sendMail(
    application.email,
    `Candidature reçue pour ${property.name}`,
    `Bonjour ${application.first_name},\nVotre candidature est bien reçue. Suivez-la ici : ${baseUrl()}/suivi/${token}`,
  );
  await sendMail("proprietaire", `Nouvelle candidature · ${property.name}`, `${baseUrl()}/proprio/candidatures/${application.id}`);
  redirect(`/suivi/${token}?nouveau=1`);
}

/** Signalement : depuis un QR public (sans bail) ou depuis « Mon séjour » (rattaché au bail). */
export async function reportIncident(_prev: { ok?: boolean; error?: string } | null, form: FormData) {
  const token = String(form.get("token") ?? "");
  const equipmentSlug = String(form.get("equipment") ?? "");
  let description = String(form.get("description") ?? "").trim();
  if (!description && DEMO) description = "Ça ne fonctionne plus depuis ce matin (signalement de démonstration).";
  if (description.length < 10) return { error: "Décrivez le problème en une phrase au moins." };
  const photos = form.getAll("photos").filter((f) => f instanceof File && f.size > 0);
  if (photos.length > 3) return { error: "3 photos au maximum." };

  const stay = token ? await data.getStayByToken(token) : null;
  const eq = equipmentSlug ? await data.getEquipmentBySlug(equipmentSlug) : null;
  const propertyId = stay?.property_id ?? eq?.property_id;
  if (!propertyId) return { error: "Logement introuvable." };

  await data.createIncident({
    property_id: propertyId,
    stay_id: stay?.id ?? null,
    equipment_id: eq?.id ?? null,
    description,
    urgency: form.get("urgency") === "urgente" ? "urgente" : "normale",
    photos: photos.length,
  });
  await sendMail("proprietaire", "Nouveau signalement", description);
  revalidatePath("/proprio");
  if (token) revalidatePath(`/sejour/${token}/signaler`);
  return { ok: true };
}

export async function addArrivalPhotos(token: string, _prev: unknown, form: FormData) {
  const stay = await data.getStayByToken(token);
  if (!stay) return { error: "Lien expiré." };
  const room = String(form.get("room") ?? "Pièce");
  const files = form.getAll("photos").filter((f): f is File => f instanceof File && f.size > 0);
  const names = files.length ? files.map((f) => f.name) : DEMO ? [`${room.toLowerCase().replace(/\W+/g, "-")}-demo.jpg`] : [];
  if (!names.length) return { error: "Choisissez au moins une photo." };
  await data.addArrivalPhotos(stay.id, names.map((name) => ({ room, name })));
  revalidatePath(`/sejour/${token}/signaler`);
  return { ok: true };
}

export async function resetDemoAction() {
  await data.resetDemo();
  redirect("/");
}

// ---------- Propriétaire ----------
// MVP : pas encore d'authentification. Avec Supabase, chaque action vérifie la session
// (lien magique) et filtre par owner_id.

export async function changeApplicationStatus(applicationId: string, status: ApplicationStatus, refuseOthers: string[] = []) {
  const a = await data.setApplicationStatus(applicationId, status);
  if (a) {
    await sendMail(a.email, `Votre candidature : ${applicationStatusLabel[status]}`, "Le détail est sur votre lien de suivi.");
  }
  for (const otherId of refuseOthers) {
    const o = await data.setApplicationStatus(otherId, "refusee");
    if (o) await sendMail(o.email, "Votre candidature : Refusée", "Le logement n'est plus disponible à vos dates.");
  }
  revalidatePath("/proprio", "layout");
}

export async function createStayFromApplication(_prev: { error?: string } | null, form: FormData): Promise<{ error?: string } | null> {
  const app = await data.getApplication(String(form.get("application_id")));
  if (!app || app.status !== "acceptee") return { error: "La candidature doit être acceptée." };
  const start = String(form.get("start_date") || app.start_date);
  const end = String(form.get("end_date") || app.end_date);
  const err = checkLeaseDates(start, end);
  if (err) return { error: err };
  const code = String(form.get("key_box_code") ?? "").trim() || (DEMO ? "1234" : "");
  if (!/^\d{4,6}$/.test(code)) return { error: "Le code de la boîte à clés fait 4 à 6 chiffres." };

  const { stay, token } = await data.createStay({
    property_id: app.property_id,
    application_id: app.id,
    tenant_name: `${app.first_name} ${app.last_name}`,
    tenant_email: app.email,
    start_date: start,
    end_date: end,
    rent: Number(form.get("rent")) || (await data.getProperty(app.property_id))?.rent || 0,
    charges: Number(form.get("charges")) || (await data.getProperty(app.property_id))?.charges || 0,
    key_box_code: code,
    annexes: Object.fromEntries(ANNEXES.map((a) => [a, false])),
  });
  const link = `${baseUrl()}/sejour/${token}`;
  await sendMail(app.email, "Votre lien « Mon séjour »", `Tout votre séjour est ici : ${link}`);
  // On ouvre la page du séjour avec le lien affiché une fois, pour pouvoir le copier.
  redirect(`/proprio/sejours/${stay.id}?lien=${encodeURIComponent(link)}`);
}

export async function regenerateLink(stayId: string) {
  const token = await data.regenerateStayToken(stayId);
  const stay = await data.getStay(stayId);
  const link = `${baseUrl()}/sejour/${token}`;
  if (stay) await sendMail(stay.tenant_email, "Votre nouveau lien « Mon séjour »", link);
  return link;
}

export async function toggleAnnex(stayId: string, annex: string) {
  await data.toggleAnnex(stayId, annex);
  revalidatePath(`/proprio/sejours/${stayId}`);
}

export async function uploadStayDocument(stayId: string, form: FormData) {
  const file = form.get("file");
  const kind = String(form.get("kind")) as StayDocument["kind"];
  const labels: Record<StayDocument["kind"], string> = {
    bail: "Bail mobilité signé.pdf",
    etat_des_lieux: "État des lieux.pdf",
    inventaire: "Inventaire du mobilier.pdf",
    diagnostics: "Diagnostics.pdf",
  };
  const hasFile = file instanceof File && file.size > 0;
  if (!hasFile && !DEMO) return;
  await data.addStayDocument(stayId, kind, hasFile ? (file as File).name : labels[kind]);
  revalidatePath(`/proprio/sejours/${stayId}`);
}

export async function changeIncidentStatus(incidentId: string, status: IncidentStatus) {
  await data.setIncidentStatus(incidentId, status);
  revalidatePath("/proprio", "layout");
}

export async function saveProperty(propertyId: string, form: FormData) {
  await data.updateProperty(propertyId, {
    rent: Number(form.get("rent")),
    charges: Number(form.get("charges")),
    tagline: String(form.get("tagline")),
    description: String(form.get("description")),
    published: form.get("published") === "on",
  });
  revalidatePath("/", "layout");
}

export type GouvState = {
  geocode?: Awaited<ReturnType<typeof geocode>>;
  dpe?: Awaited<ReturnType<typeof findDpe>>;
  error?: string;
} | null;

/** Interroge data.gouv (API Adresse + DPE ADEME) pour l'adresse de la fiche. */
export async function lookupGouv(propertyId: string, _prev: GouvState): Promise<GouvState> {
  const p = await data.getProperty(propertyId);
  if (!p) return { error: "Logement introuvable." };
  try {
    const [g, dpe] = await Promise.all([geocode(p.address), findDpe(p.address)]);
    if (g) await data.updateProperty(p.id, { lat: g.lat, lng: g.lng });
    revalidatePath(`/proprio/logements/${p.id}`);
    return { geocode: g, dpe };
  } catch {
    return { error: "data.gouv ne répond pas. Réessayez dans un instant." };
  }
}

export async function applyDpe(propertyId: string, form: FormData) {
  await data.updateProperty(propertyId, {
    dpe: {
      label: String(form.get("label")) as never,
      ges: String(form.get("ges")) as never,
      conso: Number(form.get("conso")),
      source: `ADEME, DPE n° ${form.get("numero")}`,
    },
  });
  revalidatePath("/", "layout");
}

const ANNEXES = [
  "Notice d'information",
  "État des lieux d'entrée",
  "Inventaire du mobilier",
  "DPE",
  "ERP (risques)",
  "Diagnostic électricité",
];
