import Link from "next/link";
import { listProperties, listStays, ownerAlerts } from "@/lib/data";
import { todayIso } from "@/lib/format";
import { Page, PageHeader } from "@/components/ui";
import { IconAlert, IconCalendar, IconInbox, IconScale } from "@/components/icons";

export const metadata = { title: "Alertes" };

const icon = {
  incident: <IconAlert className="size-5" />,
  candidature: <IconInbox className="size-5" />,
  entree: <IconCalendar className="size-5" />,
  sortie: <IconCalendar className="size-5" />,
  dpe: <IconScale className="size-5" />,
};

export default async function Alertes() {
  const [alerts, props, stays] = await Promise.all([ownerAlerts(), listProperties(), listStays()]);
  const today = todayIso();
  const occupied = props.filter((p) => stays.some((s) => s.property_id === p.id && s.start_date <= today && s.end_date >= today)).length;

  return (
    <Page>
      <PageHeader title="Bonjour Gabriel">
        {occupied} logement{occupied > 1 ? "s" : ""} occupé{occupied > 1 ? "s" : ""} sur {props.length}.{" "}
        {alerts.length ? `${alerts.length} point${alerts.length > 1 ? "s" : ""} à regarder.` : "Rien à signaler."}
      </PageHeader>
      <ul className="space-y-2 px-4">
        {alerts.map((a, i) => (
          <li key={i}>
            <Link
              href={a.href}
              className={`flex gap-3 rounded-2xl bg-blanc p-4 ${a.urgent ? "shadow-[inset_4px_0_0_var(--color-balise)]" : ""}`}
            >
              <span className={`flex size-10 shrink-0 items-center justify-center rounded-full ${a.kind === "incident" || a.kind === "dpe" ? "bg-balise-clair" : "bg-emeraude-clair text-emeraude-fonce"}`}>
                {icon[a.kind]}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-semibold">{a.title}</span>
                <span className="line-clamp-2 block text-sm text-granit-doux">{a.detail}</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </Page>
  );
}
