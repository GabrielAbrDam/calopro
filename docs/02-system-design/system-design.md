# System design — Calopro V1 (MVP)

Basé sur `../01-prd/PRD-Calopro-v2.md`. Code dans `../../web`.

## Architecture

```
Navigateur (PWA mobile)
   │
   ▼
Next.js 15, App Router (Netlify)
   ├─ Pages serveur : lisent via src/lib/data (une seule porte d'accès aux données)
   ├─ Server actions (src/app/actions.ts) : candidature, signalement, décisions propriétaire
   ├─ src/lib/gouv.ts ──► API Adresse (BAN/IGN) + API DPE ADEME (référencées sur data.gouv.fr)
   └─ src/lib/mail.ts ──► Resend (MVP : console)
   │
   ▼
src/lib/data
   ├─ aujourd'hui : stockage en mémoire, rempli par seed.ts
   └─ demain     : Supabase Postgres + Storage UE (supabase/schema.sql)
```

## Accès sans login

| Qui | URL | Contrôle |
| --- | --- | --- |
| Visiteur | `/`, `/logements`, `/logements/[slug]`, `/conditions` | Public |
| Candidat | `/suivi/[jeton]` | Jeton 32 octets, stocké haché ; valable jusqu'à décision + 30 j |
| Locataire | `/sejour/[jeton]/…` | Jeton haché, révocable, régénérable ; expire fin de bail + 15 j |
| Personne dans le logement | `/q/[slug-equipement]`, `/livret/[slug-logement]` | Public, aucune donnée personnelle ; slug stable |
| Propriétaire | `/proprio/…` | MVP : ouvert (démo). Production : lien magique Supabase + RLS `owner_id` |

Le code de boîte à clés n'est affiché que dans `/sejour/[jeton]` le jour d'entrée, jamais dans un mail.

## Modèle de données

Tables V1 du PRD : `properties`, `equipment`, `guide_sections`, `applications` (+ historique, `application_files`), `stays` (+ photos d'arrivée), `stay_documents`, `incidents` (+ `incident_photos`). Chacune porte `owner_id`. Types TypeScript : `web/src/lib/types.ts` ; SQL : `web/supabase/schema.sql`.

## Flux principaux

1. **Candidature** : fiche → 3 étapes (dates ≤ 10 mois + motif, DossierFacile ou pièces, consentement) → jeton de suivi par mail → alerte propriétaire.
2. **Décision** : accepter propose de refuser les candidatures qui chevauchent ; chaque changement envoie un mail.
3. **Séjour** : créé depuis une candidature acceptée (dates, loyer, forfait, code boîte) → lien « Mon séjour » envoyé → dépôt des PDF, checklist d'annexes.
4. **Signalement** : depuis un QR (équipement prérempli, sans bail) ou depuis « Mon séjour » (rattaché au bail) → incident Envoyé → Pris en charge → Résolu.

## Brancher Supabase (étape suivante)

1. Créer le projet en région UE, appliquer `supabase/schema.sql`.
2. Réécrire les fonctions de `src/lib/data/index.ts` avec `@supabase/supabase-js` (mêmes signatures ; clé `service_role` côté serveur pour les accès par jeton).
3. Importer `seed.ts` comme jeu de données initial.
4. Ajouter le lien magique sur `/proprio` (middleware) et Storage privé avec URL signées 10 min.
