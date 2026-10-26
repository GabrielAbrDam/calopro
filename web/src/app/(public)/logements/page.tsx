import Link from "next/link";
import { listProperties, nextAvailableDate } from "@/lib/data";
import { dateLong, eur, todayIso } from "@/lib/format";
import { Page, PageHeader, PhotoTile, Pill } from "@/components/ui";

export const metadata = { title: "Logements" };

export default async function Catalogue() {
  const props = (await listProperties()).filter((p) => p.published);
  const items = await Promise.all(props.map(async (p) => ({ p, free: await nextAvailableDate(p.id) })));
  const today = todayIso();
  // « Indisponible » si loué sur toute la fenêtre d'un bail mobilité (10 mois).
  const horizon = new Date();
  horizon.setMonth(horizon.getMonth() + 10);

  return (
    <Page>
      <PageHeader title="Les logements" kicker="Saint-Malo">
        Loyers charges comprises, forfait sans régularisation.
      </PageHeader>
      <ul className="space-y-5 px-4">
        {items.map(({ p, free }) => {
          const unavailable = new Date(free) > horizon;
          return (
            <li key={p.id}>
              <Link href={`/logements/${p.slug}`} className="block overflow-hidden rounded-2xl bg-blanc">
                <PhotoTile {...p.photos[0]} className="h-52 rounded-none" />
                <div className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h2 className="titre-moyen text-2xl">{p.name}</h2>
                      <p className="text-granit-doux">{p.tagline}</p>
                    </div>
                    <p className="text-right">
                      <span className="block text-xl font-bold tabular-nums">{eur(p.rent + p.charges)}</span>
                      <span className="text-xs text-granit-doux">par mois CC</span>
                    </p>
                  </div>
                  <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
                    <Pill>{p.surface} m²</Pill>
                    <Pill>{p.rooms}</Pill>
                    {unavailable ? (
                      <Pill tone="alerte">Indisponible</Pill>
                    ) : free <= today ? (
                      <Pill tone="ok">Libre maintenant</Pill>
                    ) : (
                      <Pill tone="info">Libre le {dateLong(free)}</Pill>
                    )}
                  </div>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </Page>
  );
}
