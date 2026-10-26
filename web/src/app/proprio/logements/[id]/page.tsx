import Link from "next/link";
import { notFound } from "next/navigation";
import { getProperty, listEquipment } from "@/lib/data";
import { saveProperty } from "@/app/actions";
import { Card, DpeScale, Page, PageHeader } from "@/components/ui";
import { IconPrinter } from "@/components/icons";
import { GouvLookup } from "./gouv-lookup";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  return { title: (await getProperty((await params).id))?.name ?? "Logement" };
}

export default async function FicheProprio({ params }: { params: Promise<{ id: string }> }) {
  const p = await getProperty((await params).id);
  if (!p) notFound();
  const equipment = await listEquipment(p.id);
  const dpeAlert = p.dpe.label === "G" || p.dpe.label === "F";

  return (
    <Page>
      <PageHeader title={p.name} back={{ href: "/proprio/logements", label: "Logements" }}>
        {p.address}
      </PageHeader>
      <div className="space-y-4 px-4">
        <div className="grid grid-cols-2 gap-2">
          <Link href={`/logements/${p.slug}`} className="btn btn-secondaire">
            Aperçu de l'annonce
          </Link>
          <Link href={`/proprio/logements/${p.id}/qr`} className="btn btn-secondaire">
            <IconPrinter className="size-5" /> Planche de QR
          </Link>
        </div>

        {dpeAlert && (
          <p className="rounded-2xl bg-balise-clair p-4 text-sm" role="alert">
            <strong>DPE {p.dpe.label}.</strong>{" "}
            {p.dpe.label === "G"
              ? "Ce logement ne peut plus être loué avec un nouveau bail depuis 2025."
              : "Ce logement ne pourra plus être loué à partir du 1er janvier 2028. Prévoyez des travaux ou un nouveau diagnostic."}
          </p>
        )}

        <Card>
          <h2 className="titre-moyen mb-3 text-xl">Énergie et adresse</h2>
          <DpeScale label={p.dpe.label} conso={p.dpe.conso} />
          <p className="mt-1 text-xs text-granit-doux">Source : {p.dpe.source}</p>
          <p className="mt-3 text-sm text-granit-doux">
            Coordonnées : {p.lat.toFixed(5)}, {p.lng.toFixed(5)}
          </p>
          <GouvLookup propertyId={p.id} />
        </Card>

        <Card>
          <h2 className="titre-moyen mb-3 text-xl">Annonce</h2>
          <form action={saveProperty.bind(null, p.id)} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <label>
                <span className="mb-1 block text-sm font-semibold">Loyer (€)</span>
                <input name="rent" type="number" min={0} defaultValue={p.rent} className="champ" />
              </label>
              <label>
                <span className="mb-1 block text-sm font-semibold">Forfait charges (€)</span>
                <input name="charges" type="number" min={0} defaultValue={p.charges} className="champ" />
              </label>
            </div>
            <label className="block">
              <span className="mb-1 block text-sm font-semibold">Accroche</span>
              <input name="tagline" defaultValue={p.tagline} className="champ" />
            </label>
            <label className="block">
              <span className="mb-1 block text-sm font-semibold">Description</span>
              <textarea name="description" rows={5} defaultValue={p.description} className="champ" />
            </label>
            <label className="flex min-h-11 items-center gap-3">
              <input type="checkbox" name="published" defaultChecked={p.published} className="size-5 accent-emeraude" />
              Publiée dans le catalogue
            </label>
            <button className="btn btn-primaire w-full">Enregistrer la fiche</button>
          </form>
        </Card>

        <section>
          <h2 className="titre-moyen mb-2 text-xl">Équipements</h2>
          <ul className="space-y-2">
            {equipment.map((e) => (
              <li key={e.id} className="flex items-center gap-3 rounded-2xl bg-blanc p-3">
                <div className="min-w-0 flex-1">
                  <p className="font-semibold">{e.name}</p>
                  <p className="text-sm text-granit-doux">
                    {e.notice.length} étapes · {e.video ? `vidéo ${e.video.duration}` : "pas de vidéo"}
                    {e.public_facing ? " · sur l'annonce" : ""}
                  </p>
                </div>
                <Link href={`/q/${e.slug}`} className="btn btn-secondaire min-h-11 px-3 text-sm">
                  Notice
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </Page>
  );
}
