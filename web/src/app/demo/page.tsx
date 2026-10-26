import Link from "next/link";
import { DEMO_TOKENS, listEquipment, listProperties } from "@/lib/data";
import { Page, PageHeader } from "@/components/ui";
import { resetDemoAction } from "@/app/actions";

export const metadata = { title: "Démo", robots: { index: false } };

// Page de test : tous les points d'entrée de l'app avec les jetons de démonstration.
export default async function Demo() {
  const props = await listProperties();
  const eq = await listEquipment(props[0].id);
  const groups = [
    {
      title: "Visiteur et candidat",
      links: [
        ["Accueil", "/"],
        ["Catalogue", "/logements"],
        ["Fiche : La Digue", "/logements/la-digue"],
        ["Candidater : La Digue", "/logements/la-digue/candidater"],
        ["Suivi : Camille (reçue)", `/suivi/${DEMO_TOKENS.appCamille}`],
        ["Suivi : Julien (en étude)", `/suivi/${DEMO_TOKENS.appJulien}`],
        ["Suivi : Marc (refusée)", `/suivi/${DEMO_TOKENS.appMarc}`],
      ],
    },
    {
      title: "Locataires",
      links: [
        ["Thomas, entrée aujourd'hui (code visible)", `/sejour/${DEMO_TOKENS.stayRocabey}`],
        ["Léa, séjour en cours", `/sejour/${DEMO_TOKENS.stayCorsaire}`],
        ["Livret de Léa", `/sejour/${DEMO_TOKENS.stayCorsaire}/livret`],
        ["Lien invalide", "/sejour/lien-perime"],
      ],
    },
    {
      title: "QR collés dans Le Corsaire",
      links: [["QR livret", `/livret/${props[0].slug}`], ...eq.map((e) => [`QR ${e.name}`, `/q/${e.slug}`])],
    },
    { title: "Propriétaire", links: [["Alertes", "/proprio"], ["Candidatures", "/proprio/candidatures"], ["Séjours et incidents", "/proprio/sejours"]] },
  ];

  return (
    <Page withTabs={false}>
      <PageHeader title="Accès de démonstration" back={{ href: "/", label: "Accueil" }}>
        Données fictives, dates calculées à partir d'aujourd'hui. Vos actions (candidatures, signalements…) sont gardées dans votre navigateur.
      </PageHeader>
      <div className="space-y-5 px-4">
        {groups.map((g) => (
          <section key={g.title}>
            <h2 className="titre-moyen mb-2 text-lg">{g.title}</h2>
            <ul className="overflow-hidden rounded-2xl bg-blanc">
              {g.links.map(([label, href]) => (
                <li key={href} className="border-b border-trait last:border-0">
                  <Link href={href} className="flex min-h-12 items-center px-4 hover:bg-ecume">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}
        <form action={resetDemoAction}>
          <button className="btn btn-secondaire w-full">Remettre la démo à zéro</button>
        </form>
        <p className="text-xs text-granit-doux">
          Photos d'illustration libres de droits (Wikimedia Commons, rawpixel) : ce ne sont pas les vrais logements. Crédits dans{" "}
          <a className="underline" href="/photos/CREDITS.md">photos/CREDITS.md</a>.
        </p>
      </div>
    </Page>
  );
}
