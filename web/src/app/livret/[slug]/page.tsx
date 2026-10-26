import { notFound } from "next/navigation";
import { getPropertyBySlug } from "@/lib/data";
import { GuideView } from "@/components/guide-view";

// Cible du QR « livret » collé dans le logement : livret sans données personnelles.
export default async function LivretPublic({ params }: { params: Promise<{ slug: string }> }) {
  const p = await getPropertyBySlug((await params).slug);
  if (!p) notFound();
  return <GuideView propertyId={p.id} withTabs={false} />;
}
