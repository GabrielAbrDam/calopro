import Link from "next/link";
import { listEquipment, listIncidents, listProperties, listStays } from "@/lib/data";
import { dateShort, daysBetween, todayIso } from "@/lib/format";
import { Page, PageHeader, Pill } from "@/components/ui";
import { IncidentRow } from "./incident-row";

export const metadata = { title: "Séjours" };

export default async function Sejours() {
  const [stays, props, incidents] = await Promise.all([listStays(), listProperties(), listIncidents()]);
  const eqs = (await Promise.all(props.map((p) => listEquipment(p.id)))).flat();
  const today = todayIso();
  const pname = (id: string) => props.find((p) => p.id === id)?.name ?? "";
  const open = incidents.filter((i) => i.status !== "resolu");
  const closed = incidents.filter((i) => i.status === "resolu");

  return (
    <Page>
      <PageHeader title="Séjours" />
      <ul className="space-y-2 px-4">
        {stays.map((s) => {
          const state = s.end_date < today ? "Terminé" : s.start_date > today ? `Entrée dans ${daysBetween(today, s.start_date)} j` : s.start_date === today ? "Entrée aujourd'hui" : `${daysBetween(today, s.end_date)} j restants`;
          return (
            <li key={s.id}>
              <Link href={`/proprio/sejours/${s.id}`} className="block rounded-2xl bg-blanc p-4">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-semibold">{s.tenant_name}</span>
                  <Pill tone={s.start_date === today ? "attention" : "info"}>{state}</Pill>
                </div>
                <p className="mt-1 text-sm text-granit-doux">
                  {pname(s.property_id)} · {dateShort(s.start_date)} → {dateShort(s.end_date)}
                </p>
              </Link>
            </li>
          );
        })}
      </ul>

      <section id="incidents" className="scroll-mt-4 px-4 pt-8">
        <h2 className="titre-moyen mb-2 text-2xl">Incidents ouverts</h2>
        {open.length === 0 && <p className="text-granit-doux">Aucun incident ouvert.</p>}
        <ul className="space-y-2">
          {open.map((i) => (
            <IncidentRow key={i.id} incident={i} propertyName={pname(i.property_id)} equipmentName={eqs.find((e) => e.id === i.equipment_id)?.name} />
          ))}
        </ul>
        {closed.length > 0 && (
          <details className="mt-4">
            <summary className="min-h-11 cursor-pointer font-semibold text-granit-doux">Résolus ({closed.length})</summary>
            <ul className="mt-2 space-y-2">
              {closed.map((i) => (
                <IncidentRow key={i.id} incident={i} propertyName={pname(i.property_id)} equipmentName={eqs.find((e) => e.id === i.equipment_id)?.name} />
              ))}
            </ul>
          </details>
        )}
      </section>
    </Page>
  );
}
