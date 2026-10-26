import Link from "next/link";
import { Card, Page, PageHeader } from "@/components/ui";

export const metadata = { title: "Ma demande" };

export default function SuiviSansLien() {
  return (
    <Page>
      <PageHeader title="Ma demande" kicker="Suivi de candidature" />
      <div className="space-y-4 px-4">
        <Card>
          <p className="leading-relaxed">
            Votre suivi s'ouvre avec le lien reçu dans le mail de confirmation, sans compte ni mot de passe. Ouvrez ce mail depuis ce téléphone pour
            retrouver votre demande.
          </p>
        </Card>
        <Link href="/logements" className="btn btn-primaire w-full">
          Pas encore candidat ? Voir les logements
        </Link>
      </div>
    </Page>
  );
}
