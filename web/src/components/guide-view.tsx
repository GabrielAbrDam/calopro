import Link from "next/link";
import { listEquipment, listGuideSections, RELAY_CONTACT } from "@/lib/data";
import type { Equipment, GuideSectionKey } from "@/lib/types";
import { Page, PageHeader, RelayCard } from "./ui";
import { VideoBlock } from "./video-block";

const ORDER: GuideSectionKey[] = ["arrivee", "cles", "chauffage", "internet", "electromenager", "dechets", "depart", "saint-malo"];
const EQUIPMENT_FOR: Partial<Record<GuideSectionKey, Equipment["kind"][]>> = {
  cles: ["cles"],
  chauffage: ["chauffage"],
  internet: ["internet"],
  electromenager: ["electromenager", "cuisine"],
  dechets: ["dechets"],
};

export async function GuideView({ propertyId, withTabs = true }: { propertyId: string; withTabs?: boolean }) {
  const [sections, equipment] = await Promise.all([listGuideSections(propertyId), listEquipment(propertyId)]);
  return (
    <Page withTabs={withTabs}>
      <PageHeader title="Livret d'accueil">Tout ce qu'il faut savoir sur le logement. Disponible hors ligne une fois ouvert.</PageHeader>
      <nav className="sticky top-0 z-10 -mt-1 flex gap-2 overflow-x-auto bg-ecume/95 px-4 py-2 backdrop-blur" aria-label="Rubriques">
        {ORDER.map((k) => {
          const s = sections.find((x) => x.key === k && x.property_id === null);
          return (
            <a key={k} href={`#${k}`} className="shrink-0 rounded-full bg-blanc px-3.5 py-2 text-sm font-semibold">
              {s?.title}
            </a>
          );
        })}
      </nav>
      <div className="space-y-4 px-4 pt-2">
        <RelayCard {...RELAY_CONTACT} />
        {ORDER.map((k) => {
          const group = sections.filter((s) => s.key === k);
          const eqs = equipment.filter((e) => EQUIPMENT_FOR[k]?.includes(e.kind));
          return (
            <section key={k} id={k} className="scroll-mt-16 overflow-hidden rounded-2xl bg-blanc p-4">
              {k === "saint-malo" && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src="/photos/saint-malo-pieux.jpg" alt="Les brise-lames devant les remparts de Saint-Malo" className="-mx-4 -mt-4 mb-4 h-44 w-[calc(100%+2rem)] max-w-none object-cover" />
              )}
              {group.map((s, i) => (
                <div key={s.id} className={i ? "mt-4 border-t border-trait pt-4" : ""}>
                  <h2 className={i ? "font-semibold" : "titre-moyen text-2xl"}>{s.title}</h2>
                  <div className="prose-courte mt-2 leading-relaxed">
                    {s.body.map((b, j) => (
                      <p key={j}>{b}</p>
                    ))}
                  </div>
                  {s.video && (
                    <div className="mt-3">
                      <VideoBlock video={s.video} title={s.title} />
                    </div>
                  )}
                </div>
              ))}
              {eqs.length > 0 && (
                <ul className="mt-4 space-y-2">
                  {eqs.map((e) => (
                    <li key={e.id}>
                      <Link href={`/q/${e.slug}`} className="flex min-h-12 items-center justify-between rounded-xl bg-ecume px-3 text-sm font-semibold">
                        Notice : {e.name}
                        <span className="text-granit-doux">{e.video ? e.video.duration : ""}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          );
        })}
      </div>
    </Page>
  );
}
