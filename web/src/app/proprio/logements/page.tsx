import Link from "next/link";
import { listEquipment, listProperties, nextAvailableDate } from "@/lib/data";
import { dateLong, eur, todayIso } from "@/lib/format";
import { Page, PageHeader, PhotoTile, Pill } from "@/components/ui";

export const metadata = { title: "Logements" };

export default async function LogementsProprio() {
  const props = await listProperties();
  const rows = await Promise.all(
    props.map(async (p) => ({ p, free: await nextAvailableDate(p.id), eq: (await listEquipment(p.id)).length })),
  );
  return (
    <Page>
      <PageHeader title="Logements">Une fiche par logement : elle alimente l'annonce, le livret et les QR.</PageHeader>
      <ul className="space-y-3 px-4">
        {rows.map(({ p, free, eq }) => (
          <li key={p.id}>
            <Link href={`/proprio/logements/${p.id}`} className="flex gap-3 rounded-2xl bg-blanc p-3">
              <PhotoTile room="" tone={p.photos[0].tone} className="size-20 shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="font-semibold">{p.name}</p>
                <p className="text-sm text-granit-doux">
                  {eur(p.rent + p.charges)} CC · {eq} équipements
                </p>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {free <= todayIso() ? <Pill tone="attention">Libre</Pill> : <Pill tone="info">Occupé jusqu'au {dateLong(free)}</Pill>}
                  {(p.dpe.label === "F" || p.dpe.label === "G") && <Pill tone="alerte">DPE {p.dpe.label}</Pill>}
                  {!p.published && <Pill>Brouillon</Pill>}
                </div>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </Page>
  );
}
