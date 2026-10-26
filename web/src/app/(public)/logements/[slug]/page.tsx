import Link from "next/link";
import { notFound } from "next/navigation";
import { getPropertyBySlug, listEquipment, nextAvailableDate } from "@/lib/data";
import { dateLong, eur, todayIso } from "@/lib/format";
import { Card, DpeScale, MapEmbed, Page, PageHeader, PhotoTile } from "@/components/ui";
import { VideoBlock } from "@/components/video-block";
import { IconMapPin, IconWalk } from "@/components/icons";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const p = await getPropertyBySlug((await params).slug);
  return { title: p?.name ?? "Logement" };
}

export default async function FicheLogement({ params }: { params: Promise<{ slug: string }> }) {
  const p = await getPropertyBySlug((await params).slug);
  if (!p) notFound();
  const [equipment, free] = await Promise.all([listEquipment(p.id), nextAvailableDate(p.id)]);
  const shown = equipment.filter((e) => e.public_facing);

  return (
    <Page>
      <PageHeader title={p.name} kicker={p.tagline} back={{ href: "/logements", label: "Logements" }} />

      <div className="-mt-1 flex snap-x snap-mandatory gap-2 overflow-x-auto px-4 pb-2" aria-label="Photos">
        {p.photos.slice(0, 10).map((ph, i) => (
          <PhotoTile key={i} {...ph} className="h-64 w-[85%] shrink-0 snap-center" />
        ))}
      </div>

      <div className="space-y-4 px-4 pt-3">
        <Card>
          <dl className="grid grid-cols-2 gap-y-3 text-sm">
            <div>
              <dt className="text-granit-doux">Loyer charges comprises</dt>
              <dd className="text-2xl font-bold tabular-nums">{eur(p.rent + p.charges)}</dd>
              <dd className="text-granit-doux">dont {eur(p.charges)} de forfait</dd>
            </div>
            <div>
              <dt className="text-granit-doux">Disponible</dt>
              <dd className="text-lg font-semibold">{free <= todayIso() ? "Maintenant" : dateLong(free)}</dd>
            </div>
            <div>
              <dt className="text-granit-doux">Surface</dt>
              <dd className="font-semibold">{p.surface} m², {p.rooms.toLowerCase()}</dd>
            </div>
            <div>
              <dt className="text-granit-doux">Étage</dt>
              <dd className="font-semibold">{p.floor}</dd>
            </div>
          </dl>
          <p className="mt-4 leading-relaxed">{p.description}</p>
        </Card>

        {p.tourVideo && (
          <section>
            <h2 className="titre-moyen mb-2 text-xl">Visite en vidéo</h2>
            <VideoBlock video={p.tourVideo} title="Visite du logement" />
          </section>
        )}

        <section>
          <h2 className="titre-moyen mb-2 text-xl">Équipements</h2>
          <ul className="space-y-2">
            {shown.map((e) => (
              <li key={e.id}>
                <details className="group rounded-2xl bg-blanc">
                  <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between px-4 font-semibold">
                    {e.name}
                    <span className="text-sm font-normal text-granit-doux group-open:hidden">{e.video ? `Vidéo ${e.video.duration}` : "Notice"}</span>
                  </summary>
                  <div className="space-y-3 px-4 pb-4">
                    {e.video && <VideoBlock video={e.video} title={e.name} />}
                    <p className="text-sm text-granit-doux">{e.notice[0]}</p>
                  </div>
                </details>
              </li>
            ))}
          </ul>
          <p className="mt-2 text-sm text-granit-doux">Aussi : lit 140 avec couette, linge de maison, vaisselle complète, aspirateur, fer à repasser.</p>
        </section>

        <Card>
          <h2 className="titre-moyen mb-3 text-xl">Performance énergétique</h2>
          <DpeScale label={p.dpe.label} conso={p.dpe.conso} />
          <p className="mt-1 text-xs text-granit-doux">Émissions : classe {p.dpe.ges}. Source : {p.dpe.source}.</p>
        </Card>

        <section>
          <h2 className="titre-moyen mb-2 text-xl">Emplacement</h2>
          <p className="mb-3 flex items-center gap-2 text-granit-doux">
            <IconMapPin className="size-5 shrink-0" /> {p.address}
          </p>
          <MapEmbed lat={p.lat} lng={p.lng} label={p.name} />
          <ul className="mt-3 grid grid-cols-3 gap-2">
            {p.walk.map((w) => (
              <li key={w.label} className="rounded-xl bg-blanc p-3 text-center">
                <IconWalk className="mx-auto size-5 text-emeraude" />
                <span className="mt-1 block text-lg font-bold tabular-nums">{w.minutes === 0 ? "Dedans" : `${w.minutes} min`}</span>
                <span className="text-xs text-granit-doux">{w.label}</span>
              </li>
            ))}
          </ul>
        </section>

        <Link href="/conditions" className="block py-2 text-center text-sm text-granit-doux underline underline-offset-4">
          Ai-je droit au bail mobilité ?
        </Link>
        <div className="sticky bottom-[112px] z-20 -mx-4 bg-gradient-to-t from-ecume via-ecume to-ecume/0 px-4 pt-6 pb-3">
          <Link href={`/logements/${p.slug}/candidater`} className="btn btn-primaire w-full">
            Candidater pour {p.name}
          </Link>
        </div>
      </div>
    </Page>
  );
}
