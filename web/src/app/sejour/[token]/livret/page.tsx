import { notFound } from "next/navigation";
import { getStayByToken } from "@/lib/data";
import { GuideView } from "@/components/guide-view";

export default async function Livret({ params }: { params: Promise<{ token: string }> }) {
  const stay = await getStayByToken((await params).token);
  if (!stay) notFound();
  return <GuideView propertyId={stay.property_id} />;
}
