// Modèle de données V1 (PRD v2). Chaque type correspond à une future table Supabase.

export type DpeLabel = "A" | "B" | "C" | "D" | "E" | "F" | "G";

export type Property = {
  id: string;
  owner_id: string;
  slug: string;
  name: string;
  tagline: string;
  description: string;
  address: string;
  lat: number;
  lng: number;
  surface: number;
  rooms: string;
  floor: string;
  rent: number; // loyer hors forfait
  charges: number; // forfait de charges (bail mobilité : pas de régularisation)
  dpe: { label: DpeLabel; ges: DpeLabel; conso: number; source: string };
  walk: { label: string; minutes: number }[];
  photos: { room: string; tone: string; src?: string }[];
  tourVideo: Video | null;
  parking: string;
  published: boolean;
  lease_type: "mobilite";
};

export type Video = { provider: "youtube" | "bunny"; id: string; duration: string } | null;

export type Equipment = {
  id: string;
  owner_id: string;
  property_id: string;
  slug: string; // slug stable, cible du QR
  name: string;
  kind: "chauffage" | "internet" | "electromenager" | "dechets" | "cles" | "cuisine" | "eau";
  location: string;
  notice: string[];
  video: Video;
  public_facing: boolean; // montré sur la fiche annonce
};

export type GuideSectionKey =
  | "arrivee"
  | "cles"
  | "chauffage"
  | "internet"
  | "electromenager"
  | "dechets"
  | "depart"
  | "saint-malo";

export type GuideSection = {
  id: string;
  owner_id: string;
  property_id: string | null; // null = commune aux 3 logements
  key: GuideSectionKey;
  title: string;
  body: string[];
  video: Video;
};

export type ApplicationStatus = "recue" | "en_etude" | "acceptee" | "refusee";

export type Application = {
  id: string;
  owner_id: string;
  property_id: string;
  token_hash: string;
  created_at: string;
  status: ApplicationStatus;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  start_date: string;
  end_date: string;
  motive: string;
  dossier_facile_url: string | null;
  files: { name: string; size: number }[];
  message: string;
  history: { at: string; status: ApplicationStatus }[];
};

export type Stay = {
  id: string;
  owner_id: string;
  property_id: string;
  application_id: string | null;
  token_hash: string;
  token_revoked: boolean;
  tenant_name: string;
  tenant_email: string;
  start_date: string;
  end_date: string;
  rent: number;
  charges: number;
  key_box_code: string; // chiffré en base en V1
  annexes: Record<string, boolean>;
  arrival_photos: { room: string; name: string; at: string }[];
};

export type StayDocument = {
  id: string;
  owner_id: string;
  stay_id: string;
  kind: "bail" | "etat_des_lieux" | "inventaire" | "diagnostics";
  name: string;
  uploaded_at: string;
};

export type IncidentStatus = "envoye" | "pris_en_charge" | "resolu";

export type Incident = {
  id: string;
  owner_id: string;
  property_id: string;
  stay_id: string | null; // rattaché seulement via le lien « Mon séjour »
  equipment_id: string | null;
  created_at: string;
  description: string;
  urgency: "normale" | "urgente";
  status: IncidentStatus;
  photos: number;
};
