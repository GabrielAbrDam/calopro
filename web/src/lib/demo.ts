// Mode démonstration : actif par défaut. NEXT_PUBLIC_DEMO=0 pour le désactiver en production.
// En démo : barre de rôles, valeurs par défaut dans les formulaires, aucun champ bloquant,
// jetons de démo toujours valides.
export const DEMO = process.env.NEXT_PUBLIC_DEMO !== "0";

/** Hauteur de la barre de rôles, pour décaler la barre d'onglets au-dessus. */
export const ROLE_BAR_HEIGHT = DEMO ? 52 : 0;
