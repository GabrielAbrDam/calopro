import { notFound } from "next/navigation";
import { getPropertyBySlug, nextAvailableDate } from "@/lib/data";
import { Page, PageHeader } from "@/components/ui";
import { ApplyForm } from "./apply-form";

export const metadata = { title: "Candidature" };

export default async function Candidater({ params }: { params: Promise<{ slug: string }> }) {
  const p = await getPropertyBySlug((await params).slug);
  if (!p) notFound();
  const free = await nextAvailableDate(p.id);
  return (
    <Page>
      <PageHeader title="Candidater" kicker={p.name} back={{ href: `/logements/${p.slug}`, label: p.name }} />
      <ApplyForm slug={p.slug} minDate={free} />
    </Page>
  );
}
