import { notFound } from "next/navigation";
import { getApplicationByToken, getProperty } from "@/lib/data";
import { applicationStatusLabel, dateLong, dateTime, daysBetween, todayIso } from "@/lib/format";
import type { ApplicationStatus } from "@/lib/types";
import { Card, Page, PageHeader, Pill } from "@/components/ui";

export const metadata = { title: "Ma demande", robots: { index: false } };

const ORDER: ApplicationStatus[] = ["recue", "en_etude", "acceptee"];

const explain: Record<ApplicationStatus, string> = {
  recue: "Votre dossier est arrivé. Le propriétaire le regarde en général sous 48 heures.",
  en_etude: "Votre dossier est en cours d'étude. Vous recevrez un mail dès la décision.",
  acceptee: "Bonne nouvelle : votre candidature est acceptée. Vous allez recevoir le bail à signer, puis votre lien « Mon séjour ».",
  refusee: "Votre candidature n'a pas été retenue. Vos pièces seront supprimées dans 3 mois au plus tard.",
};

export default async function Suivi({ params, searchParams }: { params: Promise<{ token: string }>; searchParams: Promise<{ nouveau?: string }> }) {
  const a = await getApplicationByToken((await params).token);
  if (!a) notFound();
  // Lien valable jusqu'à la décision + 30 jours.
  const decided = a.history.findLast((h) => h.status === "acceptee" || h.status === "refusee");
  if (decided && daysBetween(decided.at.slice(0, 10), todayIso()) > 30) notFound();
  const p = await getProperty(a.property_id);
  const isNew = (await searchParams).nouveau === "1";
  const refused = a.status === "refusee";
  const steps = refused ? (["recue", "en_etude", "refusee"] as ApplicationStatus[]) : ORDER;
  const current = steps.indexOf(a.status);

  return (
    <Page>
      <PageHeader title={applicationStatusLabel[a.status]} kicker={`Votre candidature · ${p?.name}`} />
      <div className="space-y-4 px-4">
        {isNew && (
          <p className="rounded-2xl bg-emeraude-clair p-4 text-emeraude-fonce" role="status">
            Candidature envoyée. Gardez ce lien : il vient aussi de partir par mail.
          </p>
        )}
        <Card>
          <ol className="space-y-4">
            {steps.map((s, i) => {
              const h = a.history.findLast((x) => x.status === s);
              const done = i <= current;
              return (
                <li key={s} className="flex items-start gap-3">
                  <span
                    className={`mt-0.5 size-4 shrink-0 rounded-full border-2 ${
                      done ? (s === "refusee" ? "border-alerte bg-alerte" : "border-emeraude bg-emeraude") : "border-trait"
                    }`}
                  />
                  <div className="flex-1">
                    <p className={`font-semibold ${done ? "" : "text-granit-doux"}`}>{applicationStatusLabel[s]}</p>
                    {h && <p className="text-sm text-granit-doux">{dateTime(h.at)}</p>}
                  </div>
                </li>
              );
            })}
          </ol>
          <p className="mt-4 leading-relaxed">{explain[a.status]}</p>
        </Card>
        <Card>
          <h2 className="titre-moyen mb-2 text-lg">Votre demande</h2>
          <dl className="space-y-1 text-sm">
            <div className="flex justify-between"><dt className="text-granit-doux">Dates</dt><dd>{dateLong(a.start_date)} → {dateLong(a.end_date)}</dd></div>
            <div className="flex justify-between"><dt className="text-granit-doux">Motif</dt><dd>{a.motive}</dd></div>
            <div className="flex justify-between">
              <dt className="text-granit-doux">Dossier</dt>
              <dd>{a.dossier_facile_url ? <Pill tone="info">DossierFacile</Pill> : `${a.files.length} pièce(s)`}</dd>
            </div>
          </dl>
        </Card>
      </div>
    </Page>
  );
}
