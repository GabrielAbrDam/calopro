import { notFound } from "next/navigation";
import { getProperty, listEquipment } from "@/lib/data";
import { baseUrl } from "@/lib/mail";
import { PageHeader } from "@/components/ui";
import { QrSheet } from "./qr-sheet";

export const metadata = { title: "Planche de QR" };

export default async function PlancheQr({ params }: { params: Promise<{ id: string }> }) {
  const p = await getProperty((await params).id);
  if (!p) notFound();
  const equipment = await listEquipment(p.id);
  const base = baseUrl();
  const items = [
    { label: "Livret d'accueil", sub: "Tout le logement en un scan", url: `${base}/livret/${p.slug}` },
    ...equipment.map((e) => ({ label: e.name, sub: e.location, url: `${base}/q/${e.slug}` })),
  ];
  return (
    <main className="mx-auto max-w-3xl pb-40">
      <div className="no-print">
        <PageHeader title="Planche de QR" kicker={p.name} back={{ href: `/proprio/logements/${p.id}`, label: p.name }}>
          Un QR par équipement, plus un QR pour le livret. Les liens restent valables si vous modifiez une notice : inutile de réimprimer.
        </PageHeader>
      </div>
      <QrSheet title={p.name} items={items} />
    </main>
  );
}
