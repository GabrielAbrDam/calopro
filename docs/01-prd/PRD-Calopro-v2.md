# PRD — Calopro v2 (MVP perso)

Oct 26, 2026 · @Gabriel

## Décisions tranchées

Cette version recentre Calopro sur un outil personnel pour les 3 logements de Saint-Malo : un seul compte (le propriétaire), aucun login pour candidats et locataires, et des fonctions qui servent dès la première location.

| Sujet | PRD v1 | Décision v2 | Pourquoi |
| --- | --- | --- | --- |
| Nature du produit | Hésitation outil perso / SaaS | Outil perso ; colonne `owner_id` gardée en base, rien d'autre côté SaaS | Livrer vite ; ne pas fermer la porte |
| Comptes | Candidat, locataire, propriétaire | Seul le propriétaire se connecte ; les autres reçoivent des liens à jeton | Retire l'activation, les mots de passe, les rôles |
| Dossier candidat | DossierFacile Connect (OAuth) ou pièces | Lien de partage DossierFacile **ou** pièces ; pas de convention API | Zéro démarche partenaire au MVP |
| Type de bail | Bail mobilité | Bail mobilité au MVP, règles rangées dans un « type de bail » paramétrable | Meublé classique ajoutable en V2 sans refonte |
| Objectif rentabilité | Objectif du MVP | Retiré du MVP ; un simulateur simple arrive en V2, la vraie rentabilité en V3 | Les chiffres n'ont de sens qu'après 12 mois saisis |
| Documents locataire | Générés (bail, quittances) | PDF déposés à la main par le propriétaire en V1 | Résout la contradiction V1/V2 |
| Vidéos | Streaming adaptatif | Vidéos courtes hébergées en non répertorié (YouTube ou Bunny), intégrées | Aucune infra vidéo à maintenir |
| Angle | Trois espaces séparés | Un contenu par logement, réutilisé par la vitrine, le livret et les QR en place | Voir section suivante |

## Vision et angle

Calopro est le « logement augmenté » : chaque appartement a une fiche unique (médias, équipements, notices) qui alimente à la fois l'annonce, le livret d'accueil et des QR codes collés dans le logement. On filme une fois, ça sert trois fois.

**L'angle, en trois idées**

1. **Filmer une fois, servir trois fois.** La vidéo « chauffage » montre l'équipement au candidat sur la fiche, guide le locataire dans le livret, et s'ouvre depuis un QR collé sur la chaudière.
2. **Le logement qui répond tout seul.** Un QR par équipement (chaudière, box, lave-linge, local poubelles, boîte à clés). Le locataire scanne, voit la notice, et peut signaler un problème déjà rattaché à l'équipement, sans saisir de catégorie.
3. **Gérer à distance depuis le Luxembourg.** Arrivée autonome (boîte à code + parcours vidéo), photos d'état des lieux horodatées, contact relais local affiché. Le propriétaire n'a pas à se déplacer pour une question pratique.

**Objectifs du MVP (corrigés)**

1. Louer les 3 logements via la vitrine Calopro, sans portail payant pour la présentation et la candidature.
2. Moins de 2 questions pratiques par séjour grâce au livret et aux QR.
3. Une arrivée sans présence physique du propriétaire pour au moins 2 des 3 premières entrées.

Le suivi de rentabilité n'est plus un objectif du MVP ; il reste la cible de la V3.

## Accès sans login

Un seul compte existe : le tien, par lien magique Supabase. Candidats et locataires passent par des liens à jeton long et imprévisible, révocables depuis ton espace.

| Acteur | Comment il accède | Ce qu'il voit | Durée de vie |
| --- | --- | --- | --- |
| Visiteur / candidat | URL publique ou QR de l'annonce | Catalogue, fiches, conditions, formulaire | Permanente |
| Candidat ayant postulé | Lien de suivi reçu dans le mail de confirmation | Statut de sa seule candidature | Jusqu'à la décision + 30 jours |
| Locataire | Lien « Mon séjour » envoyé à la signature | Son logement, son livret, ses documents, ses incidents | Du jour d'entrée à la fin du bail + 15 jours, puis révoqué |
| Toute personne dans le logement | QR collé sur un équipement | Notice et vidéo de cet équipement ; bouton « signaler » | Permanente (aucune donnée personnelle) |
| Propriétaire | Lien magique par mail | Tout | Session |

**Règles de sécurité minimales**

- Jeton de 32 octets aléatoires, stocké haché en base ; jamais d'identifiant séquentiel dans l'URL.
- Toutes les lectures côté locataire et candidat passent par des fonctions serveur qui vérifient le jeton ; aucune table exposée directement.
- Les documents (bail, pièces) sont servis par URL signée à durée courte (10 minutes).
- Bouton « régénérer le lien » si un locataire perd ou transfère son lien.
- Signaler depuis un QR public est possible, mais le signalement n'est rattaché à un bail qu'avec le lien « Mon séjour ».

Comptes candidat et locataire avec mot de passe : V3, seulement si l'ouverture à d'autres bailleurs est décidée.

## Périmètre V1 : stories et critères

La V1 compte 16 stories ; elle gagne les QR, l'arrivée autonome et les photos d'état des lieux, et perd tout ce qui touche à l'argent. Les numéros d'origine (USx) sont gardés pour la traçabilité.

### Candidat (sans compte)

| ID | Story | Critères d'acceptation | Origine |
| --- | --- | --- | --- |
| C1 | Accueil : choisir « Je souhaite louer » ou « Je suis déjà locataire » | Deux boutons pleine largeur ; « déjà locataire » renvoie un nouveau lien « Mon séjour » à l'adresse du bail ; PWA installable | US1 |
| C2 | Catalogue : comparer les logements | Carte par logement : photo, surface, loyer charges comprises, prochaine date libre ; « Indisponible » si loué sur toute la période | US2 |
| C3 | Fiche logement : se projeter sans visite | 10 photos max, 1 vidéo de visite, équipements avec leurs vidéos courtes, DPE, adresse géocodée (API Adresse), temps à pied saisis par le propriétaire (Sillon, Intra-Muros, gare) | US3 |
| C4 | Conditions : savoir si j'ai droit au bail mobilité | Durée 1 à 10 mois, pas de dépôt, forfait de charges, lien Visale, liste des motifs éligibles | US4 |
| C5 | Candidature en 3 étapes | Dates (≤ 10 mois, bloqué sinon) et motif obligatoire ; lien de partage DossierFacile **ou** pièces (PDF/JPG, 10 Mo max) ; consentement RGPD ; mail de confirmation avec lien de suivi ; alerte au propriétaire | US5 |
| C6 | Suivi par lien | Statuts Reçue, En étude, Acceptée, Refusée ; mail à chaque changement ; pièces d'un dossier refusé purgées à 3 mois | US6 |

### Locataire (lien « Mon séjour »)

| ID | Story | Critères d'acceptation | Origine |
| --- | --- | --- | --- |
| L1 | Mon séjour : loyer, dates, échéance | Ouvert par le lien, sans activation ; loyer, forfait, dates d'entrée et de fin, jours restants | US7 + US8 |
| L2 | Arrivée autonome | Parcours pas à pas : adresse, parking, code de la boîte à clés (affiché seulement le jour d'entrée), vidéo d'entrée, contact relais | Nouveau |
| L3 | Livret d'accueil | Rubriques Arrivée, Clés, Chauffage, Internet, Électroménager, Déchets, Départ, Vivre à Saint-Malo ; texte court + vidéo 2 min max, sous-titrée ; consultable hors ligne après une ouverture | US10 + US12 |
| L4 | Photos d'arrivée | Le locataire ajoute des photos par pièce pendant 10 jours après l'entrée ; horodatées, jointes à l'état des lieux | Nouveau |
| L5 | Signaler un problème | Depuis le livret ou un QR d'équipement (équipement prérempli) ; description, 3 photos max, urgence ; statuts Envoyé, Pris en charge, Résolu ; numéros d'urgence en tête | US11 |
| L6 | Mes documents | Bail, état des lieux, inventaire, diagnostics en PDF déposés par le propriétaire | US9 (sans quittances) |

### Propriétaire (seul compte)

| ID | Story | Critères d'acceptation | Origine |
| --- | --- | --- | --- |
| P1 | Fiche logement unique | Médias, équipements (chacun avec notice + vidéo), loyer, disponibilités ; rubriques communes aux 3 logements + propres ; aperçu avant publication ; alerte DPE G ou F | US13 + US14 |
| P2 | Planche de QR imprimable | Un PDF A4 par logement avec un QR par équipement et un QR « livret », étiquetés | Nouveau |
| P3 | Candidatures | Liste filtrable par logement et statut ; accepter propose de refuser les autres sur les mêmes dates | US15 |
| P4 | Séjour | Créer un séjour depuis une candidature acceptée (dates, loyer, forfait, code boîte à clés) ; génère et envoie le lien « Mon séjour » ; dépôt des PDF ; checklist d'annexes | US16 allégé |

**Sorti de la V1** : loyers et quittances (US17), charges et dépenses (US18), génération du bail (US16), investissement (US20), performance (US21). Le tableau de bord V1 se limite aux alertes : candidature reçue, incident ouvert, entrée ou sortie dans les 7 jours.

## Écrans V1

15 écrans en V1, contre 22 dans le PRD v1 : la connexion candidat et locataire disparaît, Saint-Malo rejoint le livret, et les écrans financiers passent en V2.

| Espace | Écran | Stories | Onglet |
| --- | --- | --- | --- |
| Public | Accueil | C1 | — |
| Public | Catalogue | C2 | Logements |
| Public | Fiche logement | C3 | Logements |
| Public | Conditions | C4 | Conditions |
| Public | Candidature (3 étapes) | C5 | — |
| Public | Suivi de candidature | C6 | Ma demande |
| Public | Notice d'équipement (cible des QR) | L3, L5 | — |
| Locataire | Mon séjour (dont arrivée autonome) | L1, L2 | Séjour |
| Locataire | Livret | L3 | Livret |
| Locataire | Signaler + historique | L4, L5 | Signaler |
| Locataire | Documents | L6 | Documents |
| Propriétaire | Alertes | — | Accueil |
| Propriétaire | Logements + fiche + QR | P1, P2 | Logements |
| Propriétaire | Candidatures | P3 | Candidatures |
| Propriétaire | Séjours + incidents | P4, L5 | Séjours |

Navigation : barre du bas, 4 onglets maximum par espace. L'écran « Notice d'équipement » s'ouvre sans barre : c'est une page autonome, pensée pour un scan debout devant l'équipement.

## Cadre légal et contraintes

Les règles du bail mobilité de la section 3 du PRD v1 restent valables et codées en dur ; seules celles qui touchent un écran V1 sont listées ici.

| Règle | Où elle s'applique en V1 |
| --- | --- |
| Durée 1 à 10 mois, non renouvelable, un seul avenant | C5 bloque au-delà de 10 mois ; P4 refuse un séjour > 10 mois |
| Motif d'éligibilité + justificatif | C5, champ obligatoire |
| Dépôt de garantie interdit ; Visale possible | Aucun champ dépôt ; lien Visale en C4 |
| Charges au forfait, sans régularisation | Loyer affiché « charges comprises » partout |
| Préavis locataire 1 mois, par recommandé ou en main propre | Rubrique « Départ » du livret : explique la procédure, ne la remplace pas |
| DPE : G interdit depuis 2025, F en 2028 | Alerte en P1 |
| Saint-Malo : pas de location à la nuitée | Aucune durée < 1 mois proposée |
| Annexes obligatoires | Checklist en P4 |

**Contraintes produit (inchangées sauf mention)**

- Mobile-first, PWA installable depuis un lien ou un QR ; chaque écran charge en moins de 2 s en 4G.
- Cibles tactiles 44 × 44 px, contrastes AA, vidéos sous-titrées.
- Français au MVP ; anglais en V2.
- Cloisonnement par jeton (remplace le contrôle par rôle) : un lien n'ouvre qu'un séjour ou une candidature.
- RGPD : consentement explicite, purge des pièces refusées à 3 mois, purge des pièces du locataire 3 ans après la fin du bail (à valider), hébergement UE, export et suppression sur demande.
- Le code de la boîte à clés n'apparaît jamais dans une notification ni un mail, seulement dans « Mon séjour » le jour d'entrée.

## Stack et choix pragmatiques

La stack du PRD v1 est confirmée (Next.js en PWA, Supabase, Netlify) ; ce qui change, c'est qu'on ne construit que le strict nécessaire et qu'on délègue le reste.

| Besoin | Choix V1 | Ce qu'on évite |
| --- | --- | --- |
| Front | Next.js (App Router) en PWA, déployé sur Netlify | App native, stores |
| Base et fichiers | Supabase Postgres + Storage (UE) ; bucket privé, URL signées | Serveur à maintenir |
| Accès | Lien magique Supabase pour le propriétaire ; jetons hachés pour les autres, vérifiés par fonctions serveur | Gestion de comptes multiples |
| Vidéos | Hébergement non répertorié (YouTube ou Bunny Stream), intégré | Encodage et streaming maison |
| Mails | Resend (confirmation, statut, lien « Mon séjour ») | SMTP maison |
| Carte | OpenStreetMap (Leaflet) ; temps à pied saisis à la main | API de calcul d'itinéraires |
| Géocodage, DPE | API Adresse, API DPE ADEME, appelées à la création de la fiche puis stockées | Appels à chaque affichage |
| QR | Génération côté client, export PDF A4 | Service tiers |
| Hors ligne | Service worker : livret et notices mis en cache après une ouverture | Synchronisation hors ligne des formulaires |

**Modèle de données (tables V1)** : `properties`, `equipment` (notice, vidéo, slug QR), `guide_sections`, `applications`, `application_files`, `stays` (jeton haché, dates, code boîte à clés chiffré), `stay_documents`, `incidents`, `incident_photos`. Chaque table porte `owner_id`.

## Roadmap

Quatre versions, chacune utilisable seule ; la V0 manuelle couvre le premier locataire si la V1 n'est pas prête à temps.

&#91;embedded content: roadmap · 4 versions, 3 critères de passage\]

On ne passe à la version suivante qu'une fois le critère atteint sur les 3 logements pilotes. L'ouverture à d'autres bailleurs (comptes, CGU, facturation) ne se décide qu'après la V3.

## Risques et questions restantes

Le premier risque n'est plus technique : c'est de louer avant que la V1 soit prête, d'où la V0 manuelle.

| Risque | Parade |
| --- | --- |
| Premier locataire avant la V1 | V0 : annonce + DossierFacile + bail papier relu par un juriste ; Calopro reprend au séjour suivant |
| Lien « Mon séjour » transféré ou fuité | Jeton révocable, régénérable, expiré 15 jours après la fin du bail ; code boîte à clés visible le jour J seulement |
| Fuite de pièces d'identité | Lien DossierFacile en priorité ; bucket privé, URL signées 10 min, purge à 3 mois |
| Bail non conforme | Modèle unique relu par un juriste ; checklist d'annexes |
| Pas le temps de filmer | Texte d'abord ; vidéos ajoutées équipement par équipement, priorité chauffage, box, boîte à clés |
| Panne sans personne sur place | Contact relais local affiché en tête du signalement et du livret |
| QR arraché ou périmé | URL du QR = slug stable de l'équipement ; la cible se modifie sans réimprimer |

**Questions restantes (décisions à prendre par toi)**

- [ ] Date de la première entrée visée : si elle tombe avant la livraison de la V1, on passe par la V0.
- [ ] Qui est le relais sur place (proche, conciergerie, artisan), et accepte-t-il d'être affiché dans l'app ?
- [ ] Loyer par logement : le total de 2 400 €/mois pour 100 m² (24 €/m²) dépasse la fourchette d'annonces de Saint-Malo (12,6 à 19,6 €/m²) ; à confirmer avec des meublés comparables.
- [ ] Boîte à clés à code ou serrure connectée ?
- [ ] Durée de conservation des pièces du locataire après le bail (proposition : 3 ans).
- [ ] Nom de la vitrine : Calopro ou une marque Saint-Malo ?
- [ ] Régime fiscal (micro-BIC ou réel), nécessaire seulement pour la V3.
