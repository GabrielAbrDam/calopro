import { notFound } from "next/navigation";
import { getEquipmentBySlug, getProperty, RELAY_CONTACT } from "@/lib/data";
import { Notice, Page, RelayCard } from "@/components/ui";
import { EmergencyNumbers, ReportForm } from "@/components/report-form";

// Cible des QR collés dans le logement : page autonome, sans barre, aucune donnée personnelle.
// L'URL est le slug stable de l'équipement : la notice change sans réimprimer le QR.

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const e = await getEquipmentBySlug((await params).slug);
  return { title: e?.name ?? "Notice" };
}

export default async function NoticeEquipement({ params }: { params: Promise<{ slug: string }> }) {
  const e = await getEquipmentBySlug((await params).slug);
  if (!e) notFound();
  const p = await getProperty(e.property_id);

  return (
    <Page withTabs={false}>
      <header className="bg-emeraude-fonce px-4 pt-8 pb-6 text-white">
        <p className="text-sm text-white/75">{p?.name} · {e.location}</p>
        <h1 className="titre mt-1 text-[2.6rem]">{e.name}</h1>
      </header>
      <div className="space-y-6 px-4 pt-5">
        <Notice steps={e.notice} video={e.video} />

        <details className="rounded-2xl bg-blanc">
          <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between px-4 font-semibold">
            Ça ne marche toujours pas ?
            <span className="text-sm font-normal text-emeraude">Signaler</span>
          </summary>
          <div className="space-y-4 px-4 pb-4">
            <EmergencyNumbers />
            <RelayCard {...RELAY_CONTACT} />
            <ReportForm equipment={{ slug: e.slug, name: e.name }} />
            <p className="text-xs text-granit-doux">
              Vous êtes locataire ? Signalez plutôt depuis « Mon séjour » pour suivre la réponse.
            </p>
          </div>
        </details>
      </div>
    </Page>
  );
}
