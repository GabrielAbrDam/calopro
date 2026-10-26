-- Calopro V1 : schéma Supabase (Postgres, région UE).
-- Pas encore appliqué. Reprend un pour un les types de src/lib/types.ts.
-- Principe d'accès (PRD v2) :
--   * le propriétaire se connecte par lien magique ; RLS « owner_id = auth.uid() » ;
--   * candidats et locataires n'ont aucun accès direct aux tables : le serveur Next.js
--     vérifie le jeton (haché SHA-256) avec la clé service_role puis renvoie les données.

create extension if not exists pgcrypto;

create type dpe_label as enum ('A','B','C','D','E','F','G');
create type application_status as enum ('recue','en_etude','acceptee','refusee');
create type incident_status as enum ('envoye','pris_en_charge','resolu');
create type incident_urgency as enum ('normale','urgente');
create type equipment_kind as enum ('chauffage','internet','electromenager','dechets','cles','cuisine','eau');
create type guide_key as enum ('arrivee','cles','chauffage','internet','electromenager','dechets','depart','saint-malo');
create type stay_document_kind as enum ('bail','etat_des_lieux','inventaire','diagnostics');

create table properties (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id),
  slug text not null unique,
  name text not null,
  tagline text not null default '',
  description text not null default '',
  address text not null,
  lat double precision,
  lng double precision,
  surface numeric(5,1) not null,
  rooms text not null,
  floor text not null default '',
  rent integer not null check (rent >= 0),
  charges integer not null check (charges >= 0),        -- forfait, sans régularisation
  dpe_label dpe_label,
  dpe_ges dpe_label,
  dpe_conso integer,
  dpe_source text,
  walk jsonb not null default '[]',                     -- [{label, minutes}] saisis à la main
  photos jsonb not null default '[]',                   -- chemins Storage, 10 max
  tour_video jsonb,                                     -- {provider, id, duration}
  parking text not null default '',
  published boolean not null default false,
  lease_type text not null default 'mobilite',
  created_at timestamptz not null default now()
);

create table equipment (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id),
  property_id uuid not null references properties(id) on delete cascade,
  slug text not null unique,                            -- cible stable du QR
  name text not null,
  kind equipment_kind not null,
  location text not null default '',
  notice text[] not null default '{}',
  video jsonb,
  public_facing boolean not null default false
);

create table guide_sections (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id),
  property_id uuid references properties(id) on delete cascade, -- null = commune aux logements
  key guide_key not null,
  title text not null,
  body text[] not null default '{}',
  video jsonb,
  position smallint not null default 0
);

create table applications (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id),
  property_id uuid not null references properties(id),
  token_hash text not null unique,
  created_at timestamptz not null default now(),
  status application_status not null default 'recue',
  first_name text not null,
  last_name text not null,
  email text not null,
  phone text not null,
  start_date date not null,
  end_date date not null,
  motive text not null,
  dossier_facile_url text,
  message text not null default '',
  consent_at timestamptz not null,
  decided_at timestamptz,                               -- lien de suivi valable jusqu'à +30 j
  constraint bail_mobilite_duree check (end_date > start_date and end_date <= start_date + interval '10 months')
);

create table application_status_history (
  id bigint generated always as identity primary key,
  application_id uuid not null references applications(id) on delete cascade,
  status application_status not null,
  at timestamptz not null default now()
);

create table application_files (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id),
  application_id uuid not null references applications(id) on delete cascade,
  storage_path text not null,                           -- bucket privé « pieces »
  name text not null,
  size integer not null check (size <= 10 * 1024 * 1024),
  purge_after date                                      -- refus + 3 mois
);

create table stays (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id),
  property_id uuid not null references properties(id),
  application_id uuid references applications(id),
  token_hash text not null unique,
  token_revoked boolean not null default false,
  tenant_name text not null,
  tenant_email text not null,
  start_date date not null,
  end_date date not null,
  rent integer not null,
  charges integer not null,
  key_box_code_encrypted bytea not null,                -- pgp_sym_encrypt, clé hors base
  annexes jsonb not null default '{}',
  constraint bail_mobilite_duree check (end_date > start_date and end_date <= start_date + interval '10 months')
);

create table stay_arrival_photos (
  id uuid primary key default gen_random_uuid(),
  stay_id uuid not null references stays(id) on delete cascade,
  room text not null,
  storage_path text not null,
  taken_at timestamptz not null default now()
);

create table stay_documents (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id),
  stay_id uuid not null references stays(id) on delete cascade,
  kind stay_document_kind not null,
  name text not null,
  storage_path text not null,                           -- servi par URL signée 10 min
  uploaded_at timestamptz not null default now()
);

create table incidents (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id),
  property_id uuid not null references properties(id),
  stay_id uuid references stays(id),                    -- rempli seulement via « Mon séjour »
  equipment_id uuid references equipment(id),
  created_at timestamptz not null default now(),
  description text not null,
  urgency incident_urgency not null default 'normale',
  status incident_status not null default 'envoye'
);

create table incident_photos (
  id uuid primary key default gen_random_uuid(),
  incident_id uuid not null references incidents(id) on delete cascade,
  storage_path text not null
);

-- Index utiles
create index on equipment (property_id);
create index on applications (property_id, status);
create index on stays (property_id, start_date);
create index on incidents (property_id, status);

-- RLS : tout est fermé par défaut ; seul le propriétaire lit et écrit ses lignes.
do $$
declare t text;
begin
  foreach t in array array['properties','equipment','guide_sections','applications','application_files','stays','stay_documents','incidents']
  loop
    execute format('alter table %I enable row level security', t);
    execute format('create policy owner_all on %I for all to authenticated using (owner_id = (select auth.uid())) with check (owner_id = (select auth.uid()))', t);
  end loop;
end $$;

alter table application_status_history enable row level security;
alter table stay_arrival_photos enable row level security;
alter table incident_photos enable row level security;
create policy owner_read on application_status_history for select to authenticated
  using (exists (select 1 from applications a where a.id = application_id and a.owner_id = (select auth.uid())));
create policy owner_read on stay_arrival_photos for select to authenticated
  using (exists (select 1 from stays s where s.id = stay_id and s.owner_id = (select auth.uid())));
create policy owner_read on incident_photos for select to authenticated
  using (exists (select 1 from incidents i where i.id = incident_id and i.owner_id = (select auth.uid())));

-- Lecture publique : uniquement les fiches publiées et leurs équipements/livret (sans données personnelles).
create policy public_read on properties for select to anon using (published);
create policy public_read on equipment for select to anon
  using (exists (select 1 from properties p where p.id = property_id and p.published));
create policy public_read on guide_sections for select to anon using (true);
