import Link from "next/link";
import { listApplications, listProperties } from "@/lib/data";
import { applicationStatusLabel, applicationStatusTone as statusTone, dateShort, monthsBetween } from "@/lib/format";
import type { ApplicationStatus } from "@/lib/types";
import { Page, PageHeader, Pill } from "@/components/ui";

export const metadata = { title: "Candidatures" };


export default async function Candidatures({ searchParams }: { searchParams: Promise<{ logement?: string; statut?: string }> }) {
  const sp = await searchParams;
  const props = await listProperties();
  const status = (Object.keys(applicationStatusLabel) as ApplicationStatus[]).find((s) => s === sp.statut);
  const apps = await listApplications({ propertyId: sp.logement, status });
  const pname = (id: string) => props.find((p) => p.id === id)?.name;

  const href = (patch: { logement?: string | null; statut?: string | null }) => {
    const q = new URLSearchParams();
    const l = patch.logement === undefined ? sp.logement : patch.logement;
    const s = patch.statut === undefined ? sp.statut : patch.statut;
    if (l) q.set("logement", l);
    if (s) q.set("statut", s);
    return `/proprio/candidatures${q.size ? `?${q}` : ""}`;
  };
  const chip = (active: boolean) =>
    `shrink-0 rounded-full px-3.5 py-2 text-sm font-semibold ${active ? "bg-granit text-white" : "bg-blanc text-granit"}`;

  return (
    <Page>
      <PageHeader title="Candidatures" />
      <div className="space-y-2 px-4">
        <nav className="flex gap-2 overflow-x-auto" aria-label="Filtrer par logement">
          <Link href={href({ logement: null })} className={chip(!sp.logement)}>Tous</Link>
          {props.map((p) => (
            <Link key={p.id} href={href({ logement: p.id })} className={chip(sp.logement === p.id)}>{p.name}</Link>
          ))}
        </nav>
        <nav className="flex gap-2 overflow-x-auto" aria-label="Filtrer par statut">
          <Link href={href({ statut: null })} className={chip(!status)}>Tous statuts</Link>
          {(Object.keys(applicationStatusLabel) as ApplicationStatus[]).map((s) => (
            <Link key={s} href={href({ statut: s })} className={chip(status === s)}>{applicationStatusLabel[s]}</Link>
          ))}
        </nav>
      </div>
      <ul className="mt-4 space-y-2 px-4">
        {apps.length === 0 && <li className="text-granit-doux">Aucune candidature avec ces filtres.</li>}
        {apps.map((a) => (
          <li key={a.id}>
            <Link href={`/proprio/candidatures/${a.id}`} className="block rounded-2xl bg-blanc p-4">
              <div className="flex items-center justify-between gap-2">
                <span className="font-semibold">{a.first_name} {a.last_name}</span>
                <Pill tone={statusTone[a.status]}>{applicationStatusLabel[a.status]}</Pill>
              </div>
              <p className="mt-1 text-sm text-granit-doux">
                {pname(a.property_id)} · {dateShort(a.start_date)} → {dateShort(a.end_date)} ({monthsBetween(a.start_date, a.end_date)} mois) · {a.motive}
              </p>
            </Link>
          </li>
        ))}
      </ul>
    </Page>
  );
}
