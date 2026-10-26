import Link from "next/link";
import { LEASE_RULES } from "@/lib/format";
import { Card, Page, PageHeader } from "@/components/ui";
import { IconCheck } from "@/components/icons";

export const metadata = { title: "Conditions" };

const facts = [
  { title: "De 1 à 10 mois", body: "Durée fixée au départ, non renouvelable. Une seule prolongation par avenant, dans la limite de 10 mois au total." },
  { title: "Aucun dépôt de garantie", body: "La loi l'interdit pour le bail mobilité. La garantie Visale, gratuite, peut couvrir les loyers impayés." },
  { title: "Charges au forfait", body: "Un montant fixe chaque mois, sans régularisation. Il comprend eau, chauffage, internet et électricité des parties communes." },
  { title: "Départ libre", body: "Vous pouvez partir à tout moment avec un préavis d'un mois." },
];

export default function Conditions() {
  return (
    <Page>
      <PageHeader title="Le bail mobilité" kicker="Conditions">
        Un bail meublé court, pensé pour les personnes en transition professionnelle ou en formation.
      </PageHeader>
      <div className="space-y-4 px-4">
        <ul className="grid gap-3">
          {facts.map((f) => (
            <li key={f.title} className="rounded-2xl bg-blanc p-4">
              <h2 className="titre-moyen text-lg">{f.title}</h2>
              <p className="mt-1 text-granit-doux">{f.body}</p>
            </li>
          ))}
        </ul>

        <Card>
          <h2 className="titre-moyen text-xl">Vous y avez droit si, à l'entrée, vous êtes en</h2>
          <ul className="mt-3 space-y-2">
            {LEASE_RULES.motives.map((m) => (
              <li key={m} className="flex gap-2">
                <IconCheck className="size-5 shrink-0 text-emeraude" />
                {m.toLowerCase()}
              </li>
            ))}
          </ul>
          <p className="mt-3 text-sm text-granit-doux">Un justificatif vous sera demandé (convention de stage, contrat de mission, certificat de scolarité…).</p>
        </Card>

        <a href={LEASE_RULES.visaleUrl} target="_blank" rel="noreferrer" className="btn btn-secondaire w-full">
          Obtenir la garantie Visale
        </a>
        <Link href="/logements" className="btn btn-primaire w-full">
          Voir les logements
        </Link>
        <p className="pb-4 text-xs text-granit-doux">
          Saint-Malo n'autorise pas la location à la nuitée pour ces logements : aucune durée inférieure à un mois n'est proposée.
        </p>
      </div>
    </Page>
  );
}
