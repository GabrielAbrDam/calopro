import Link from "next/link";
import { notFound } from "next/navigation";
import { getApplication, getProperty, listStays, overlappingApplications } from "@/lib/data";
import { applicationStatusLabel, applicationStatusTone, dateLong, dateTime, monthsBetween } from "@/lib/format";
import { Card, Page, PageHeader, Pill } from "@/components/ui";
import { IconFile, IconLink } from "@/components/icons";
import { Decision } from "./decision";
import { CreateStayForm } from "./create-stay-form";

export const metadata = { title: "Candidature" };

export default async function CandidatureDetail({ params }: { params: Promise<{ id: string }> }) {
  const a = await getApplication((await params).id);
  if (!a) notFound();
  const [p, overlaps, stays] = await Promise.all([getProperty(a.property_id), overlappingApplications(a.id), listStays()]);
  const stay = stays.find((s) => s.application_id === a.id);

  return (
    <Page>
      <PageHeader title={`${a.first_name} ${a.last_name}`} kicker={p?.name} back={{ href: "/proprio/candidatures", label: "Candidatures" }}>
        <Pill tone={applicationStatusTone[a.status]}>{applicationStatusLabel[a.status]}</Pill>
      </PageHeader>
      <div className="space-y-4 px-4">
        <Card>
          <dl className="space-y-2 text-sm">
            <Row k="Dates" v={`${dateLong(a.start_date)} → ${dateLong(a.end_date)} (${monthsBetween(a.start_date, a.end_date)} mois)`} />
            <Row k="Motif" v={a.motive} />
            <Row k="Mail" v={<a className="underline" href={`mailto:${a.email}`}>{a.email}</a>} />
            <Row k="Téléphone" v={<a className="underline" href={`tel:${a.phone.replace(/\s/g, "")}`}>{a.phone}</a>} />
            <Row k="Reçue" v={dateTime(a.created_at)} />
          </dl>
          {a.message && <p className="mt-3 rounded-xl bg-ecume p-3 leading-relaxed">« {a.message} »</p>}
        </Card>

        <Card>
          <h2 className="titre-moyen mb-2 text-lg">Dossier</h2>
          {a.dossier_facile_url ? (
            <a href={a.dossier_facile_url} target="_blank" rel="noreferrer" className="flex min-h-12 items-center gap-2 font-semibold text-emeraude">
              <IconLink className="size-5" /> Ouvrir le dossier DossierFacile
            </a>
          ) : (
            <ul className="space-y-1">
              {a.files.map((f) => (
                <li key={f.name} className="flex min-h-11 items-center gap-2">
                  <IconFile className="size-5 text-granit-doux" />
                  <span className="flex-1">{f.name}</span>
                  <span className="text-sm text-granit-doux">{(f.size / 1_000_000).toFixed(1)} Mo</span>
                </li>
              ))}
            </ul>
          )}
          <p className="mt-2 text-xs text-granit-doux">Pièces servies par lien signé 10 minutes. Supprimées 3 mois après un refus.</p>
        </Card>

        {a.status !== "acceptee" && a.status !== "refusee" && (
          <Decision
            applicationId={a.id}
            status={a.status}
            overlaps={overlaps.map((o) => ({ id: o.id, name: `${o.first_name} ${o.last_name}`, dates: `${dateLong(o.start_date)} → ${dateLong(o.end_date)}` }))}
          />
        )}

        {a.status === "acceptee" &&
          (stay ? (
            <Link href={`/proprio/sejours/${stay.id}`} className="btn btn-secondaire w-full">
              Voir le séjour de {stay.tenant_name}
            </Link>
          ) : (
            <Card>
              <h2 className="titre-moyen mb-3 text-xl">Créer le séjour</h2>
              <CreateStayForm applicationId={a.id} start={a.start_date} end={a.end_date} rent={p?.rent ?? 0} charges={p?.charges ?? 0} />
            </Card>
          ))}
      </div>
    </Page>
  );
}

function Row({ k, v }: { k: string; v: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-granit-doux">{k}</dt>
      <dd className="text-right">{v}</dd>
    </div>
  );
}
