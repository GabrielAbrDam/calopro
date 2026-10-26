import { notFound } from "next/navigation";
import { getProperty, getStay, listIncidents, listStayDocuments } from "@/lib/data";
import { toggleAnnex, uploadStayDocument } from "@/app/actions";
import { dateLong, dateTime, eur } from "@/lib/format";
import { Card, Page, PageHeader } from "@/components/ui";
import { IconCheck, IconFile } from "@/components/icons";
import { RegenerateLink } from "./regenerate-link";
import { IncidentRow } from "../incident-row";

export const metadata = { title: "Séjour" };

export default async function SejourDetail({ params }: { params: Promise<{ id: string }> }) {
  const s = await getStay((await params).id);
  if (!s) notFound();
  const [p, docs, incidents] = await Promise.all([getProperty(s.property_id), listStayDocuments(s.id), listIncidents({ stayId: s.id })]);
  const annexes = Object.entries(s.annexes);
  const missing = annexes.filter(([, ok]) => !ok).length;

  return (
    <Page>
      <PageHeader title={s.tenant_name} kicker={p?.name} back={{ href: "/proprio/sejours", label: "Séjours" }}>
        {dateLong(s.start_date)} → {dateLong(s.end_date)} · {eur(s.rent + s.charges)} CC
      </PageHeader>
      <div className="space-y-4 px-4">
        <Card>
          <h2 className="titre-moyen text-xl">Lien « Mon séjour »</h2>
          <p className="mt-1 text-sm text-granit-doux">
            Valable jusqu'à 15 jours après la fin du bail. Régénérez-le si le locataire l'a perdu ou transféré : l'ancien cesse aussitôt de fonctionner.
          </p>
          <RegenerateLink stayId={s.id} />
        </Card>

        <Card>
          <div className="flex items-baseline justify-between">
            <h2 className="titre-moyen text-xl">Annexes obligatoires</h2>
            <span className={`text-sm font-semibold ${missing ? "text-alerte" : "text-emeraude"}`}>{missing ? `${missing} manquante${missing > 1 ? "s" : ""}` : "Complet"}</span>
          </div>
          <ul className="mt-2">
            {annexes.map(([name, ok]) => (
              <li key={name}>
                <form action={toggleAnnex.bind(null, s.id, name)}>
                  <button className="flex min-h-11 w-full items-center gap-3 text-left">
                    <span className={`flex size-6 items-center justify-center rounded-md border-2 ${ok ? "border-emeraude bg-emeraude text-white" : "border-trait"}`}>
                      {ok && <IconCheck className="size-4" />}
                    </span>
                    {name}
                  </button>
                </form>
              </li>
            ))}
          </ul>
        </Card>

        <Card>
          <h2 className="titre-moyen text-xl">Documents du locataire</h2>
          <ul className="mt-2 space-y-1">
            {docs.map((d) => (
              <li key={d.id} className="flex min-h-11 items-center gap-2 text-sm">
                <IconFile className="size-5 text-emeraude" />
                <span className="flex-1">{d.name}</span>
                <span className="text-granit-doux">{dateLong(d.uploaded_at)}</span>
              </li>
            ))}
          </ul>
          <form action={uploadStayDocument.bind(null, s.id)} className="mt-3 space-y-2">
            <select name="kind" className="champ" aria-label="Type de document">
              <option value="bail">Bail</option>
              <option value="etat_des_lieux">État des lieux</option>
              <option value="inventaire">Inventaire</option>
              <option value="diagnostics">Diagnostics</option>
            </select>
            <input type="file" name="file" accept="application/pdf" required className="champ py-3" aria-label="Fichier PDF" />
            <button className="btn btn-secondaire w-full">Déposer le PDF</button>
          </form>
        </Card>

        <Card>
          <h2 className="titre-moyen text-xl">Photos d'arrivée</h2>
          {s.arrival_photos.length === 0 ? (
            <p className="mt-1 text-sm text-granit-doux">Aucune photo pour l'instant. Le locataire peut en ajouter pendant 10 jours après l'entrée.</p>
          ) : (
            <ul className="mt-2 space-y-1 text-sm">
              {s.arrival_photos.map((ph, i) => (
                <li key={i} className="flex justify-between gap-2">
                  <span>{ph.room} · {ph.name}</span>
                  <span className="text-granit-doux">{dateTime(ph.at)}</span>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <section>
          <h2 className="titre-moyen mb-2 text-xl">Incidents</h2>
          {incidents.length === 0 ? (
            <p className="text-granit-doux">Aucun incident sur ce séjour.</p>
          ) : (
            <ul className="space-y-2">
              {incidents.map((i) => (
                <IncidentRow key={i.id} incident={i} propertyName={p?.name ?? ""} />
              ))}
            </ul>
          )}
        </section>
      </div>
    </Page>
  );
}
