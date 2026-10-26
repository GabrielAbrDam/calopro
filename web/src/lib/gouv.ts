import "server-only";
import type { DpeLabel } from "./types";

// API publiques référencées sur data.gouv.fr, appelées à la création ou mise à jour
// d'une fiche puis stockées (jamais à chaque affichage).
// - API Adresse (BAN, IGN) : https://data.geopf.fr/geocodage
// - API DPE logements existants (ADEME) : https://data.ademe.fr/data-fair/api/v1/datasets/dpe03existant

const SAINT_MALO_INSEE = "35288";

export type GeocodeResult = { label: string; lat: number; lng: number; score: number };

export async function geocode(address: string): Promise<GeocodeResult | null> {
  const url = `https://data.geopf.fr/geocodage/search?q=${encodeURIComponent(address)}&limit=1`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) return null;
  const json = await res.json();
  const f = json.features?.[0];
  if (!f) return null;
  return {
    label: f.properties.label,
    lng: f.geometry.coordinates[0],
    lat: f.geometry.coordinates[1],
    score: f.properties.score,
  };
}

export type DpeRecord = {
  numero: string;
  address: string;
  label: DpeLabel;
  ges: DpeLabel;
  conso: number;
  surface: number;
  date: string;
};

/** DPE d'appartements trouvés à une adresse (numéro + rue), les plus récents d'abord. */
export async function findDpe(addressLine: string, inseeCode = SAINT_MALO_INSEE): Promise<DpeRecord[]> {
  const line = addressLine.split(",")[0].trim();
  const number = line.match(/^\d+/)?.[0];
  const street = line.replace(/^\d+\s*(bis|ter)?\s*/i, "");
  const params = new URLSearchParams({
    size: "20",
    q: street,
    q_mode: "complete",
    qs: `code_insee_ban:${inseeCode}`,
    select:
      "numero_dpe,adresse_ban,etiquette_dpe,etiquette_ges,conso_5_usages_par_m2_ep,surface_habitable_logement,date_etablissement_dpe",
    sort: "-date_etablissement_dpe",
  });
  const res = await fetch(`https://data.ademe.fr/data-fair/api/v1/datasets/dpe03existant/lines?${params}`, {
    cache: "no-store",
  });
  if (!res.ok) return [];
  const json = await res.json();
  const records: DpeRecord[] = (json.results ?? []).map(
    (r: Record<string, string | number>): DpeRecord => ({
      numero: String(r.numero_dpe),
      address: String(r.adresse_ban),
      label: r.etiquette_dpe as DpeLabel,
      ges: r.etiquette_ges as DpeLabel,
      conso: Number(r.conso_5_usages_par_m2_ep),
      surface: Number(r.surface_habitable_logement),
      date: String(r.date_etablissement_dpe),
    }),
  );
  // Même numéro de rue en premier, puis les voisins (utile pour estimer un ordre de grandeur).
  const sameNumber = (r: DpeRecord) => (number && r.address.startsWith(`${number} `) ? 0 : 1);
  return records.sort((a, b) => sameNumber(a) - sameNumber(b)).slice(0, 8);
}
