# Calopro — web

MVP du PRD v2 : Next.js 15 (App Router) en PWA, données de démonstration en mémoire.

```bash
npm install
npm run dev
```

Puis ouvrir http://localhost:3000/demo : tous les points d'entrée (candidat, locataires, QR, propriétaire) avec les jetons de démo.

## Où sont les choses

- `src/lib/types.ts` : modèle de données (une future table par type)
- `src/lib/data/seed.ts` : données de démo (adresses et DPE réels via data.gouv, personnes fictives, dates relatives à aujourd'hui)
- `src/lib/data/index.ts` : seule porte d'accès aux données, à réécrire pour Supabase
- `src/lib/gouv.ts` : API Adresse et API DPE ADEME, utilisées par « Actualiser depuis data.gouv » sur la fiche propriétaire
- `src/app/actions.ts` : toutes les écritures (server actions)
- `supabase/schema.sql` : schéma Postgres + RLS, pas encore appliqué

Les mails sont affichés dans la console du serveur (`[mail]`). Les données reviennent à zéro au redémarrage.
