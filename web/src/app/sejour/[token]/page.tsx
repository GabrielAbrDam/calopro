import { notFound } from "next/navigation";
import { getProperty, getStayByToken, listEquipment, listGuideSections, RELAY_CONTACT } from "@/lib/data";
import { dateLong, daysBetween, eur, todayIso } from "@/lib/format";
import { Card, MapEmbed, Page, PageHeader, RelayCard } from "@/components/ui";
import { VideoBlock } from "@/components/video-block";
import { IconKey } from "@/components/icons";

export default async function MonSejour({ params }: { params: Promise<{ token: string }> }) {
  const stay = await getStayByToken((await params).token);
  if (!stay) notFound();
  const p = (await getProperty(stay.property_id))!;
  const [equipment, sections] = await Promise.all([listEquipment(p.id), listGuideSections(p.id)]);
  const keyBox = equipment.find((e) => e.kind === "cles");
  const arrivalVideo = sections.find((s) => s.key === "arrivee" && s.video)?.video;

  const today = todayIso();
  const isEntryDay = today === stay.start_date;
  const beforeEntry = today < stay.start_date;
  const total = daysBetween(stay.start_date, stay.end_date);
  const left = daysBetween(today, stay.end_date);
  const elapsed = Math.min(1, Math.max(0, (total - left) / total));
  const firstName = stay.tenant_name.split(" ")[0];

  return (
    <Page>
      <PageHeader title={`Bonjour ${firstName}`} kicker={p.name}>
        {beforeEntry ? `Entrée dans ${daysBetween(today, stay.start_date)} jours.` : isEntryDay ? "Bienvenue, c'est le jour de votre arrivée." : `${left} jours restants.`}
      </PageHeader>

      <div className="space-y-4 px-4">
        <Card>
          <div className="flex items-end justify-between">
            <div>
              <p className="text-sm text-granit-doux">Loyer charges comprises</p>
              <p className="text-3xl font-bold tabular-nums">{eur(stay.rent + stay.charges)}</p>
              <p className="text-sm text-granit-doux">dont {eur(stay.charges)} de forfait, sans régularisation</p>
            </div>
          </div>
          <div className="mt-4">
            <div className="h-2 overflow-hidden rounded-full bg-sable">
              <div className="h-full rounded-full bg-emeraude" style={{ width: `${elapsed * 100}%` }} />
            </div>
            <div className="mt-1.5 flex justify-between text-sm">
              <span>{dateLong(stay.start_date)}</span>
              <span>{dateLong(stay.end_date)}</span>
            </div>
          </div>
        </Card>

        {(beforeEntry || isEntryDay) && (
          <section aria-labelledby="arrivee">
            <h2 id="arrivee" className="titre-moyen mb-3 text-2xl">
              Votre arrivée
            </h2>
            <ol className="space-y-3">
              <li className="rounded-2xl bg-blanc p-4">
                <h3 className="font-semibold">1. L'adresse</h3>
                <p className="mb-3 text-granit-doux">{p.address}</p>
                <MapEmbed lat={p.lat} lng={p.lng} label={p.name} />
              </li>
              <li className="rounded-2xl bg-blanc p-4">
                <h3 className="font-semibold">2. Se garer</h3>
                <p className="text-granit-doux">{p.parking}</p>
              </li>
              <li className="rounded-2xl bg-blanc p-4">
                <h3 className="font-semibold">3. Récupérer les clés</h3>
                <p className="mb-3 text-granit-doux">{keyBox?.location}</p>
                {isEntryDay ? (
                  <div className="flex items-center gap-4 rounded-xl bg-balise p-4 text-granit">
                    <IconKey className="size-8" />
                    <div>
                      <p className="text-sm font-semibold">Code de la boîte à clés</p>
                      <p className="text-4xl font-extrabold tracking-[0.3em] tabular-nums">{stay.key_box_code}</p>
                    </div>
                  </div>
                ) : (
                  <p className="rounded-xl bg-sable p-3 text-sm">
                    Le code s'affichera ici le {dateLong(stay.start_date)}. Il n'est jamais envoyé par mail.
                  </p>
                )}
                {keyBox?.video && (
                  <div className="mt-3">
                    <VideoBlock video={keyBox.video} title="Ouvrir la boîte à clés" />
                  </div>
                )}
              </li>
              {arrivalVideo && (
                <li className="rounded-2xl bg-blanc p-4">
                  <h3 className="mb-3 font-semibold">4. Entrer dans le logement</h3>
                  <VideoBlock video={arrivalVideo} title="Parcours d'entrée" />
                </li>
              )}
            </ol>
          </section>
        )}

        <section>
          <h2 className="titre-moyen mb-2 text-lg">Une question sur place ?</h2>
          <RelayCard {...RELAY_CONTACT} />
        </section>
      </div>
    </Page>
  );
}
