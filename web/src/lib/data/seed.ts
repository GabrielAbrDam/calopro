// Données de démonstration. Les adresses, coordonnées (API Adresse / BAN) et ordres de
// grandeur DPE (API DPE ADEME, Saint-Malo, code INSEE 35288) viennent de data.gouv.fr ;
// les personnes, loyers et séjours sont fictifs.
// Les dates sont relatives à aujourd'hui pour que la démo reste vivante.

import { createHash } from "crypto";
import type {
  Application,
  Equipment,
  GuideSection,
  Incident,
  Property,
  Stay,
  StayDocument,
} from "../types";

export const OWNER_ID = "owner-gabriel";

export function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export function day(offset: number) {
  const d = new Date();
  d.setHours(12, 0, 0, 0);
  d.setDate(d.getDate() + offset);
  return d.toISOString().slice(0, 10);
}

function at(offsetDays: number, hour = 10) {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  d.setHours(hour, 12, 0, 0);
  return d.toISOString();
}

// Jetons en clair uniquement pour la démo : en base, seul le hash est stocké.
export const DEMO_TOKENS = {
  stayCorsaire: "EpKxJwzJcArblPpCvSJ4X9V-adjj4u0q-23GvVzIqjk",
  stayRocabey: "-2T-JqtitaOeOOltx4yBxl8ovI9sHj0fVUAN3YXqEZQ",
  appCamille: "RXtYUS5neR7r3aLTgk5lJrrbhEDh4TKdHSrhXYdU0FI",
  appJulien: "JtDzSSEkn8V6Lf7CWIusq_lsqSJt4U24iEYlX0Puv9k",
  appInes: "hN97j_SU0a6CNrsV8yE8yvGXPuHvNZT4e9hJOr0HKCo",
  appMarc: "GHShkWlzAyTHBDyd-f9b40qlWl6iaBlb6mXrPKf7J2c",
  appThomas: "9LoJvgJ4l0rKppNkOEaABKnPEQXdzO-xZ5K0KuMjd7c",
};

export const RELAY_CONTACT = {
  name: "Yann Le Goff",
  role: "Relais sur place, à 10 min des logements",
  phone: "06 12 48 73 90",
};

export const OWNER_CONTACT = {
  name: "Gabriel",
  phone: "+352 621 48 19 07",
  email: "contact@calopro.fr",
};

const v = (duration: string) => ({ provider: "youtube" as const, id: "demo", duration });

export const properties: Property[] = [
  {
    id: "p-corsaire",
    owner_id: OWNER_ID,
    slug: "le-corsaire",
    name: "Le Corsaire",
    tagline: "Studio sous les toits, dans les remparts",
    description:
      "Un studio de 28 m² au 3e étage d'un immeuble en granit de l'Intra-Muros. Pièce de vie lumineuse avec coin nuit séparé par une verrière, cuisine équipée, salle d'eau refaite en 2024. Les remparts sont à 2 minutes, la plage de Bon-Secours à 4.",
    address: "12 Rue de Toulouse, 35400 Saint-Malo",
    lat: 48.646747,
    lng: -2.025467,
    surface: 28,
    rooms: "Studio avec coin nuit",
    floor: "3e étage sans ascenseur",
    rent: 690,
    charges: 70,
    dpe: { label: "D", ges: "B", conso: 219, source: "ADEME, DPE logements existants" },
    walk: [
      { label: "Intra-Muros", minutes: 0 },
      { label: "Plage du Sillon", minutes: 14 },
      { label: "Gare", minutes: 22 },
    ],
    photos: [
      { room: "Pièce de vie", tone: "#9FB7B1" },
      { room: "Coin nuit", tone: "#C9BFAE" },
      { room: "Cuisine", tone: "#7E9AA0" },
      { room: "Salle d'eau", tone: "#B7C7C9" },
      { room: "Vue sur les toits", tone: "#5E7C82" },
    ],
    tourVideo: v("2 min 10"),
    parking: "Pas de parking dans l'Intra-Muros. Parking payant Saint-Vincent à 3 min, abonnement mensuel possible.",
    published: true,
    lease_type: "mobilite",
  },
  {
    id: "p-rocabey",
    owner_id: OWNER_ID,
    slug: "le-rocabey",
    name: "Le Rocabey",
    tagline: "T2 calme à 9 minutes de la gare",
    description:
      "Un deux-pièces de 36 m² au 1er étage, côté cour. Chambre fermée avec rangements, séjour avec canapé convertible, cuisine ouverte. Quartier vivant avec halles et commerces, idéal pour une mission ou un stage avec allers-retours en TGV.",
    address: "17 Rue Ernest Renan, 35400 Saint-Malo",
    lat: 48.649696,
    lng: -2.005387,
    surface: 36,
    rooms: "2 pièces, 1 chambre",
    floor: "1er étage, côté cour",
    rent: 720,
    charges: 80,
    dpe: { label: "E", ges: "C", conso: 310, source: "ADEME, DPE logements existants" },
    walk: [
      { label: "Gare", minutes: 9 },
      { label: "Plage du Sillon", minutes: 7 },
      { label: "Intra-Muros", minutes: 18 },
    ],
    photos: [
      { room: "Séjour", tone: "#A9B9A4" },
      { room: "Chambre", tone: "#D2C6B2" },
      { room: "Cuisine ouverte", tone: "#8AA39B" },
      { room: "Salle de bains", tone: "#BFCBCB" },
    ],
    tourVideo: v("2 min 30"),
    parking: "Stationnement gratuit dans la rue (zone bleue en journée, disque obligatoire).",
    published: true,
    lease_type: "mobilite",
  },
  {
    id: "p-digue",
    owner_id: OWNER_ID,
    slug: "la-digue",
    name: "La Digue",
    tagline: "T2 avec vue mer partielle, côté Sillon",
    description:
      "Un deux-pièces de 36 m² au 2e étage d'une villa balnéaire du boulevard Chateaubriand. Séjour avec bow-window et vue partielle sur la mer, chambre côté jardin, cuisine séparée. La digue est au bout de la rue.",
    address: "21 Boulevard Chateaubriand, 35400 Saint-Malo",
    lat: 48.661602,
    lng: -1.990066,
    surface: 36,
    rooms: "2 pièces, 1 chambre",
    floor: "2e étage sans ascenseur",
    rent: 760,
    charges: 80,
    dpe: { label: "F", ges: "C", conso: 372, source: "ADEME, DPE logements existants" },
    walk: [
      { label: "Plage du Sillon", minutes: 2 },
      { label: "Intra-Muros", minutes: 30 },
      { label: "Gare", minutes: 24 },
    ],
    photos: [
      { room: "Séjour et bow-window", tone: "#8FB2B8" },
      { room: "Chambre", tone: "#CDC3B0" },
      { room: "Cuisine", tone: "#9AAE9E" },
      { room: "Salle d'eau", tone: "#B4C4C6" },
      { room: "Vue depuis la fenêtre", tone: "#4F7A86" },
      { room: "Entrée", tone: "#C2B8A6" },
    ],
    tourVideo: v("3 min"),
    parking: "Une place dans la cour de la villa, numéro 3.",
    published: true,
    lease_type: "mobilite",
  },
];

function eq(
  property: Property,
  key: string,
  e: Omit<Equipment, "id" | "owner_id" | "property_id" | "slug">,
): Equipment {
  return {
    id: `e-${property.slug}-${key}`,
    owner_id: OWNER_ID,
    property_id: property.id,
    slug: `${property.slug}-${key}`,
    ...e,
  };
}

const [corsaire, rocabey, digue] = properties;

export const equipment: Equipment[] = [
  // Le Corsaire
  eq(corsaire, "chauffage", {
    name: "Radiateurs à inertie",
    kind: "chauffage",
    location: "Pièce de vie et coin nuit",
    notice: [
      "Chaque radiateur a son propre boîtier : appuyez sur Mode jusqu'à voir le soleil (confort).",
      "Réglez entre 19 et 20 °C le jour. La lune (éco) baisse de 3,5 °C, utile la nuit ou en cas d'absence.",
      "Le radiateur met environ 1 h à chauffer : c'est normal, il stocke la chaleur.",
      "Ne posez pas de linge dessus, la sécurité coupe l'appareil.",
    ],
    video: v("1 min 20"),
    public_facing: true,
  }),
  eq(corsaire, "box", {
    name: "Box internet Freebox Pop",
    kind: "internet",
    location: "Meuble TV",
    notice: [
      "Réseau : Calopro-Corsaire. Le mot de passe est collé sous la box.",
      "Si internet ne marche plus : débranchez l'alimentation 10 secondes, rebranchez, attendez que l'écran affiche l'heure (3 à 5 min).",
      "Le décodeur TV est déjà associé ; la télécommande est dans le tiroir du meuble.",
    ],
    video: v("1 min"),
    public_facing: true,
  }),
  eq(corsaire, "lave-linge", {
    name: "Lave-linge séchant Bosch",
    kind: "electromenager",
    location: "Sous le plan de travail",
    notice: [
      "Programme du quotidien : Coton 40 °C, 1 h 30. Pour sécher ensuite, tournez sur Séchage et choisissez Prêt à ranger.",
      "Lessive dans le bac I, adoucissant dans le bac central.",
      "Videz le filtre (trappe en bas à droite) une fois par mois.",
    ],
    video: v("1 min 40"),
    public_facing: true,
  }),
  eq(corsaire, "induction", {
    name: "Plaque à induction",
    kind: "cuisine",
    location: "Cuisine",
    notice: [
      "Seules les casseroles aimantées chauffent. Il y en a trois dans le placard bas.",
      "Si la plaque bipe et s'éteint : touche verrouillage (cadenas) 3 secondes.",
    ],
    video: v("40 s"),
    public_facing: false,
  }),
  eq(corsaire, "poubelles", {
    name: "Local poubelles",
    kind: "dechets",
    location: "Rez-de-chaussée, porte au fond du couloir",
    notice: [
      "Bac gris : ordures ménagères, sortie le lundi et le jeudi par le syndic.",
      "Bac jaune : emballages et papiers en vrac, sans sac.",
      "Verre : colonne place Guy La Chambre, à 2 min.",
    ],
    video: null,
    public_facing: false,
  }),
  eq(corsaire, "boite-a-cles", {
    name: "Boîte à clés",
    kind: "cles",
    location: "Grille à droite de la porte d'entrée de l'immeuble",
    notice: [
      "Faites défiler les 4 molettes sur le code reçu dans « Mon séjour », puis tirez le levier vers le bas.",
      "Le trousseau contient : badge de l'immeuble, clé de l'appartement, clé de la boîte aux lettres.",
      "Au départ, remettez le trousseau et brouillez le code.",
    ],
    video: v("50 s"),
    public_facing: false,
  }),

  // Le Rocabey
  eq(rocabey, "chaudiere", {
    name: "Chaudière gaz Saunier Duval",
    kind: "chauffage",
    location: "Placard de l'entrée",
    notice: [
      "Le thermostat du séjour pilote le chauffage : réglez 19 °C, la chaudière fait le reste.",
      "Pression normale : entre 1 et 2 bars sur le manomètre. En dessous de 0,8, ouvrez doucement le robinet bleu sous la chaudière jusqu'à 1,5.",
      "Code F28 ou F29 à l'écran : appuyez sur Reset 3 secondes. Si ça revient, signalez-le.",
    ],
    video: v("2 min"),
    public_facing: true,
  }),
  eq(rocabey, "box", {
    name: "Box internet Livebox",
    kind: "internet",
    location: "Étagère du séjour",
    notice: [
      "Réseau : Calopro-Rocabey. Mot de passe sur l'étiquette au dos de la box.",
      "Panne : bouton arrière sur Off, 10 secondes, puis On. Comptez 5 minutes.",
    ],
    video: v("1 min"),
    public_facing: true,
  }),
  eq(rocabey, "lave-linge", {
    name: "Lave-linge Whirlpool",
    kind: "electromenager",
    location: "Salle de bains",
    notice: [
      "Programme Quotidien 30 min pour le linge peu sale, Coton 40 °C sinon.",
      "Un étendoir pliant est derrière la porte de la chambre.",
    ],
    video: v("1 min 10"),
    public_facing: true,
  }),
  eq(rocabey, "poubelles", {
    name: "Local poubelles",
    kind: "dechets",
    location: "Cour intérieure, abri en bois",
    notice: [
      "Bac gris le mardi, bac jaune le vendredi : sortis par la gardienne.",
      "Biodéchets : bioseau sous l'évier, à vider dans le bac marron de la cour.",
    ],
    video: null,
    public_facing: false,
  }),
  eq(rocabey, "boite-a-cles", {
    name: "Boîte à clés",
    kind: "cles",
    location: "Fixée au portail de la cour, côté gauche",
    notice: [
      "Composez le code reçu dans « Mon séjour » et appuyez sur le bouton Open.",
      "Le trousseau contient : bip du portail, clé de l'appartement, clé de la boîte aux lettres.",
    ],
    video: v("45 s"),
    public_facing: false,
  }),

  // La Digue
  eq(digue, "chaudiere", {
    name: "Chaudière gaz à condensation",
    kind: "chauffage",
    location: "Cuisine, à gauche de la fenêtre",
    notice: [
      "Le thermostat sans fil est sur le mur du séjour : 19 °C conseillé.",
      "Pression normale entre 1 et 2 bars. Si elle tombe, signalez-le, ne remplissez pas seul.",
      "L'eau chaude arrive en 20 secondes environ : laissez couler un peu.",
    ],
    video: v("1 min 50"),
    public_facing: true,
  }),
  eq(digue, "box", {
    name: "Box internet Bbox",
    kind: "internet",
    location: "Meuble de l'entrée",
    notice: [
      "Réseau : Calopro-Digue, mot de passe sous la box.",
      "Fibre : si le voyant est rouge, vérifiez que le petit câble vert est bien enfoncé dans le boîtier blanc au mur.",
    ],
    video: v("1 min"),
    public_facing: true,
  }),
  eq(digue, "lave-linge", {
    name: "Lave-linge Samsung",
    kind: "electromenager",
    location: "Cuisine",
    notice: [
      "Programme Coton 40 °C ou Rapide 15 min.",
      "Après chaque lavage, laissez la porte entrouverte pour éviter les odeurs.",
    ],
    video: v("1 min"),
    public_facing: true,
  }),
  eq(digue, "poubelles", {
    name: "Local poubelles",
    kind: "dechets",
    location: "Garage de la villa, porte de droite",
    notice: [
      "Bacs gris et jaune : sortis le mercredi soir par le voisin du rez-de-chaussée.",
      "Verre : colonne au bout de la rue, côté digue.",
    ],
    video: null,
    public_facing: false,
  }),
  eq(digue, "boite-a-cles", {
    name: "Boîte à clés",
    kind: "cles",
    location: "Sous la boîte aux lettres, à gauche du portillon",
    notice: [
      "Composez le code reçu dans « Mon séjour », poussez le bouton gris et tirez le capot.",
      "Le trousseau contient : clé du portillon, clé de l'appartement, badge du parking.",
    ],
    video: v("50 s"),
    public_facing: false,
  }),
];

function common(key: GuideSection["key"], title: string, body: string[], video: GuideSection["video"] = null): GuideSection {
  return { id: `g-${key}`, owner_id: OWNER_ID, property_id: null, key, title, body, video };
}

export const guideSections: GuideSection[] = [
  common(
    "arrivee",
    "Arrivée",
    [
      "Le jour de votre entrée, le code de la boîte à clés s'affiche dans « Mon séjour ». Il n'est jamais envoyé par mail.",
      "Prenez en photo chaque pièce dans les 10 jours : elles sont horodatées et jointes à l'état des lieux.",
      "Un problème à l'arrivée ? Appelez le relais sur place, il peut passer dans l'heure.",
    ],
    v("2 min"),
  ),
  common("cles", "Clés", [
    "Vous avez un trousseau unique. En cas de perte, prévenez-nous : un double est chez le relais.",
    "Porte claquée sans clé : appelez le relais, pas un serrurier (le dépannage serrurier reste à votre charge).",
  ]),
  common("chauffage", "Chauffage", [
    "19 °C dans les pièces de vie, 17 °C dans la chambre : c'est confortable et ça limite le forfait de charges.",
    "Aérez 5 minutes par jour, même en hiver, pour éviter l'humidité, fréquente en bord de mer.",
    "Le détail de votre appareil est dans sa notice : scannez le QR collé dessus.",
  ]),
  common("internet", "Internet", [
    "La fibre est incluse dans le forfait de charges. Le nom du réseau et le mot de passe sont sous la box.",
    "Si la connexion coupe, redémarrez la box (débrancher 10 secondes). Si ça ne revient pas en 15 minutes, signalez-le.",
  ]),
  common("electromenager", "Électroménager", [
    "Chaque appareil a un QR qui ouvre sa notice et sa vidéo.",
    "Une panne d'appareil n'est jamais à votre charge si l'usage est normal : signalez-la, on s'occupe de la réparation.",
  ]),
  common("dechets", "Déchets", [
    "Saint-Malo Agglomération trie : bac jaune pour emballages et papiers, bac gris pour le reste, colonne pour le verre.",
    "Les jours de collecte de votre immeuble sont sur la notice du local poubelles.",
  ]),
  common("depart", "Départ", [
    "Le bail mobilité se termine à la date prévue, sans renouvellement. Vous pouvez partir avant, avec un préavis d'un mois.",
    "Le préavis se donne par lettre recommandée avec accusé de réception, ou remise en main propre contre signature. Ce livret explique la procédure, il ne la remplace pas.",
    "Le jour du départ : sortez les poubelles, videz le réfrigérateur, laissez le trousseau dans la boîte à clés et brouillez le code.",
    "Aucun dépôt de garantie n'a été versé : il n'y a rien à vous rembourser.",
  ]),
  common("saint-malo", "Vivre à Saint-Malo", [
    "Les marées comptent ici : l'accès à pied au Grand Bé et au Fort National se fait à marée basse uniquement. Consultez l'horaire avant de partir, la mer remonte vite.",
    "Marchés : Intra-Muros le mardi et le vendredi matin, halles de Rocabey le samedi.",
    "Bus MAT : ligne C1 entre la gare, le Sillon et l'Intra-Muros, toutes les 10 minutes.",
    "Le Bus de mer relie Saint-Malo à Dinard en 10 minutes, d'avril à septembre.",
  ]),
  {
    id: "g-digue-parking",
    owner_id: OWNER_ID,
    property_id: digue.id,
    key: "arrivee",
    title: "Parking de la villa",
    body: ["Votre place est la numéro 3, au fond de la cour. Le badge est sur le trousseau."],
    video: null,
  },
];

export const applications: Application[] = [
  {
    id: "a-camille",
    owner_id: OWNER_ID,
    property_id: digue.id,
    token_hash: hashToken(DEMO_TOKENS.appCamille),
    created_at: at(-1, 21),
    status: "recue",
    first_name: "Camille",
    last_name: "Le Bris",
    email: "camille.lebris@exemple.fr",
    phone: "06 71 22 45 19",
    start_date: day(20),
    end_date: day(200),
    motive: "Mutation professionnelle",
    dossier_facile_url: "https://locataire.dossierfacile.logement.gouv.fr/file/demo-camille",
    files: [],
    message: "Infirmière, je rejoins le centre hospitalier Broussais pour six mois. Non fumeuse, sans animal.",
    history: [{ at: at(-1, 21), status: "recue" }],
  },
  {
    id: "a-julien",
    owner_id: OWNER_ID,
    property_id: digue.id,
    token_hash: hashToken(DEMO_TOKENS.appJulien),
    created_at: at(-4, 9),
    status: "en_etude",
    first_name: "Julien",
    last_name: "Ferrand",
    email: "j.ferrand@exemple.fr",
    phone: "07 45 10 88 32",
    start_date: day(25),
    end_date: day(115),
    motive: "Stage",
    dossier_facile_url: null,
    files: [
      { name: "convention-de-stage.pdf", size: 412_000 },
      { name: "carte-identite.jpg", size: 1_840_000 },
      { name: "garantie-visale.pdf", size: 220_000 },
    ],
    message: "Stage de fin d'études à l'école d'ingénieurs, trois mois.",
    history: [
      { at: at(-4, 9), status: "recue" },
      { at: at(-2, 18), status: "en_etude" },
    ],
  },
  {
    id: "a-ines",
    owner_id: OWNER_ID,
    property_id: digue.id,
    token_hash: hashToken(DEMO_TOKENS.appInes),
    created_at: at(-2, 14),
    status: "recue",
    first_name: "Inès",
    last_name: "Sabri",
    email: "ines.sabri@exemple.fr",
    phone: "06 03 92 17 64",
    start_date: day(60),
    end_date: day(300),
    motive: "Études supérieures",
    dossier_facile_url: "https://locataire.dossierfacile.logement.gouv.fr/file/demo-ines",
    files: [],
    message: "Master à l'École nationale supérieure maritime, second semestre.",
    history: [{ at: at(-2, 14), status: "recue" }],
  },
  {
    id: "a-marc",
    owner_id: OWNER_ID,
    property_id: corsaire.id,
    token_hash: hashToken(DEMO_TOKENS.appMarc),
    created_at: at(-12, 11),
    status: "refusee",
    first_name: "Marc",
    last_name: "Dubreuil",
    email: "marc.dubreuil@exemple.fr",
    phone: "06 54 81 20 07",
    start_date: day(5),
    end_date: day(95),
    motive: "Mission temporaire",
    dossier_facile_url: null,
    files: [{ name: "contrat-mission.pdf", size: 310_000 }],
    message: "",
    history: [
      { at: at(-12, 11), status: "recue" },
      { at: at(-10, 8), status: "refusee" },
    ],
  },
  {
    id: "a-thomas",
    owner_id: OWNER_ID,
    property_id: rocabey.id,
    token_hash: hashToken(DEMO_TOKENS.appThomas),
    created_at: at(-30, 19),
    status: "acceptee",
    first_name: "Thomas",
    last_name: "Guégan",
    email: "thomas.guegan@exemple.fr",
    phone: "06 28 37 55 41",
    start_date: day(0),
    end_date: day(150),
    motive: "Formation professionnelle",
    dossier_facile_url: "https://locataire.dossierfacile.logement.gouv.fr/file/demo-thomas",
    files: [],
    message: "Formation de cinq mois au lycée maritime.",
    history: [
      { at: at(-30, 19), status: "recue" },
      { at: at(-28, 9), status: "en_etude" },
      { at: at(-25, 17), status: "acceptee" },
    ],
  },
];

export const stays: Stay[] = [
  {
    id: "s-lea",
    owner_id: OWNER_ID,
    property_id: corsaire.id,
    application_id: null,
    token_hash: hashToken(DEMO_TOKENS.stayCorsaire),
    token_revoked: false,
    tenant_name: "Léa Morvan",
    tenant_email: "lea.morvan@exemple.fr",
    start_date: day(-55),
    end_date: day(95),
    rent: corsaire.rent,
    charges: corsaire.charges,
    key_box_code: "4821",
    annexes: {
      "Notice d'information": true,
      "État des lieux d'entrée": true,
      "Inventaire du mobilier": true,
      "DPE": true,
      "ERP (risques)": true,
      "Diagnostic électricité": true,
    },
    arrival_photos: [
      { room: "Pièce de vie", name: "piece-de-vie-1.jpg", at: at(-55, 15) },
      { room: "Salle d'eau", name: "salle-d-eau.jpg", at: at(-55, 15) },
      { room: "Cuisine", name: "cuisine-plaque.jpg", at: at(-53, 9) },
    ],
  },
  {
    id: "s-thomas",
    owner_id: OWNER_ID,
    property_id: rocabey.id,
    application_id: "a-thomas",
    token_hash: hashToken(DEMO_TOKENS.stayRocabey),
    token_revoked: false,
    tenant_name: "Thomas Guégan",
    tenant_email: "thomas.guegan@exemple.fr",
    start_date: day(0),
    end_date: day(150),
    rent: rocabey.rent,
    charges: rocabey.charges,
    key_box_code: "7305",
    annexes: {
      "Notice d'information": true,
      "État des lieux d'entrée": false,
      "Inventaire du mobilier": true,
      "DPE": true,
      "ERP (risques)": true,
      "Diagnostic électricité": false,
    },
    arrival_photos: [],
  },
];

export const stayDocuments: StayDocument[] = [
  { id: "d1", owner_id: OWNER_ID, stay_id: "s-lea", kind: "bail", name: "Bail mobilité signé.pdf", uploaded_at: at(-58) },
  { id: "d2", owner_id: OWNER_ID, stay_id: "s-lea", kind: "etat_des_lieux", name: "État des lieux d'entrée.pdf", uploaded_at: at(-55) },
  { id: "d3", owner_id: OWNER_ID, stay_id: "s-lea", kind: "inventaire", name: "Inventaire du mobilier.pdf", uploaded_at: at(-55) },
  { id: "d4", owner_id: OWNER_ID, stay_id: "s-lea", kind: "diagnostics", name: "DPE, ERP et électricité.pdf", uploaded_at: at(-58) },
  { id: "d5", owner_id: OWNER_ID, stay_id: "s-thomas", kind: "bail", name: "Bail mobilité signé.pdf", uploaded_at: at(-3) },
  { id: "d6", owner_id: OWNER_ID, stay_id: "s-thomas", kind: "diagnostics", name: "DPE et ERP.pdf", uploaded_at: at(-3) },
];

export const incidents: Incident[] = [
  {
    id: "i-1",
    owner_id: OWNER_ID,
    property_id: corsaire.id,
    stay_id: "s-lea",
    equipment_id: "e-le-corsaire-lave-linge",
    created_at: at(-2, 8),
    description: "Le lave-linge s'arrête en cours de cycle avec le code E18, l'eau ne se vide pas.",
    urgency: "normale",
    status: "pris_en_charge",
    photos: 2,
  },
  {
    id: "i-2",
    owner_id: OWNER_ID,
    property_id: corsaire.id,
    stay_id: "s-lea",
    equipment_id: "e-le-corsaire-box",
    created_at: at(-20, 19),
    description: "Plus d'internet depuis ce matin, la box affiche « Connexion en cours ».",
    urgency: "normale",
    status: "resolu",
    photos: 1,
  },
  {
    id: "i-3",
    owner_id: OWNER_ID,
    property_id: digue.id,
    stay_id: null,
    equipment_id: "e-la-digue-poubelles",
    created_at: at(0, 7),
    description: "La porte du local poubelles ne ferme plus, la serrure tourne dans le vide.",
    urgency: "normale",
    status: "envoye",
    photos: 1,
  },
];
