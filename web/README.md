# Calopro — web

MVP du PRD v2 : Next.js 15 (App Router) en PWA, données de démonstration en mémoire.

```bash
npm install
npm run dev
```

Puis ouvrir http://localhost:3000. La barre du bas « Voir en Candidat / Locataire / Propriétaire » change de rôle ; http://localhost:3000/demo liste tous les points d'entrée.

## Mode démo

Actif par défaut (`NEXT_PUBLIC_DEMO=0` pour le couper) :
- barre de changement de rôle ;
- formulaires pré-remplis, aucun champ bloquant ;
- les actions du visiteur sont gardées dans un cookie : chacun a son bac à sable, même hébergé en serverless (Netlify). Bouton « Remettre la démo à zéro » sur /demo.

## Où sont les choses

- `src/lib/types.ts` : modèle de données (une future table par type)
- `src/lib/data/seed.ts` : données de démo (adresses et DPE réels via data.gouv, personnes fictives, dates relatives à aujourd'hui)
- `src/lib/data/index.ts` : seule porte d'accès aux données, à réécrire pour Supabase
- `src/lib/gouv.ts` : API Adresse et API DPE ADEME, utilisées par « Actualiser depuis data.gouv » sur la fiche propriétaire
- `src/app/actions.ts` : toutes les écritures (server actions)
- `supabase/schema.sql` : schéma Postgres + RLS, pas encore appliqué

Les mails sont affichés dans la console du serveur (`[mail]`). Photos libres de droits, crédits dans `public/photos/CREDITS.md`.
