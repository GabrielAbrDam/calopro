import { notFound } from "next/navigation";
import { getStayByToken, listEquipment, listIncidents, RELAY_CONTACT } from "@/lib/data";
import { dateLong, dateTime, daysBetween, incidentStatusLabel, todayIso } from "@/lib/format";
import { Card, Page, PageHeader, Pill, RelayCard } from "@/components/ui";
import { EmergencyNumbers, ReportForm } from "@/components/report-form";
import { ArrivalPhotos } from "./arrival-photos";

export default async function Signaler({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const stay = await getStayByToken(token);
  if (!stay) notFound();
  const [equipment, incidents] = await Promise.all([listEquipment(stay.property_id), listIncidents({ stayId: stay.id })]);
  const eqName = (id: string | null) => equipment.find((e) => e.id === id)?.name;

  const sinceEntry = daysBetween(stay.start_date, todayIso());
  const photosOpen = sinceEntry >= 0 && sinceEntry <= 10;
  const photosUntil = new Date(stay.start_date);
  photosUntil.setDate(photosUntil.getDate() + 10);

  return (
    <Page>
      <PageHeader title="Signaler" />
      <div className="space-y-5 px-4">
        <EmergencyNumbers />
        <RelayCard {...RELAY_CONTACT} />

        <Card>
          <h2 className="titre-moyen mb-3 text-xl">Un problème dans le logement</h2>
          <ReportForm token={token} equipmentChoices={equipment.map((e) => ({ slug: e.slug, name: e.name }))} />
        </Card>

        <section>
          <h2 className="titre-moyen mb-2 text-xl">Vos signalements</h2>
          {incidents.length === 0 ? (
            <p className="text-granit-doux">Aucun signalement pour l'instant.</p>
          ) : (
            <ul className="space-y-2">
              {incidents.map((i) => (
                <li key={i.id} className="rounded-2xl bg-blanc p-4">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-semibold">{eqName(i.equipment_id) ?? "Logement"}</span>
                    <Pill tone={i.status === "resolu" ? "ok" : i.status === "pris_en_charge" ? "info" : "attention"}>{incidentStatusLabel[i.status]}</Pill>
                  </div>
                  <p className="mt-1">{i.description}</p>
                  <p className="mt-1 text-xs text-granit-doux">{dateTime(i.created_at)}</p>
                </li>
              ))}
            </ul>
          )}
        </section>

        <Card>
          <h2 className="titre-moyen text-xl">Photos d'arrivée</h2>
          <p className="mt-1 text-sm text-granit-doux">
            {photosOpen
              ? `Photographiez chaque pièce et tout défaut jusqu'au ${dateLong(photosUntil.toISOString())}. Elles sont horodatées et jointes à l'état des lieux.`
              : sinceEntry < 0
                ? "Vous pourrez ajouter vos photos pendant les 10 jours qui suivent votre entrée."
                : "La période de 10 jours après l'entrée est terminée."}
          </p>
          {photosOpen && <ArrivalPhotos token={token} />}
          {stay.arrival_photos.length > 0 && (
            <ul className="mt-3 space-y-1 text-sm">
              {stay.arrival_photos.map((ph, i) => (
                <li key={i} className="flex justify-between gap-2 border-t border-trait pt-1">
                  <span>{ph.room} · {ph.name}</span>
                  <span className="shrink-0 text-granit-doux">{dateTime(ph.at)}</span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </Page>
  );
}
