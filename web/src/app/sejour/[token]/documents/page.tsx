import { notFound } from "next/navigation";
import { getStayByToken, listStayDocuments } from "@/lib/data";
import { dateLong } from "@/lib/format";
import type { StayDocument } from "@/lib/types";
import { Page, PageHeader } from "@/components/ui";
import { IconFile } from "@/components/icons";

const KINDS: { kind: StayDocument["kind"]; label: string }[] = [
  { kind: "bail", label: "Bail" },
  { kind: "etat_des_lieux", label: "État des lieux" },
  { kind: "inventaire", label: "Inventaire" },
  { kind: "diagnostics", label: "Diagnostics" },
];

export default async function Documents({ params }: { params: Promise<{ token: string }> }) {
  const stay = await getStayByToken((await params).token);
  if (!stay) notFound();
  const docs = await listStayDocuments(stay.id);

  return (
    <Page>
      <PageHeader title="Documents">Ouverts par un lien sécurisé valable 10 minutes.</PageHeader>
      <ul className="space-y-2 px-4">
        {KINDS.map(({ kind, label }) => {
          const d = docs.find((x) => x.kind === kind);
          return (
            <li key={kind}>
              {d ? (
                <a href="#" className="flex min-h-16 items-center gap-3 rounded-2xl bg-blanc p-4">
                  <IconFile className="size-7 text-emeraude" />
                  <span className="flex-1">
                    <span className="block font-semibold">{d.name}</span>
                    <span className="text-sm text-granit-doux">Déposé le {dateLong(d.uploaded_at)}</span>
                  </span>
                  <span className="text-sm font-semibold text-emeraude">Ouvrir</span>
                </a>
              ) : (
                <div className="flex min-h-16 items-center gap-3 rounded-2xl border-[1.5px] border-dashed border-trait p-4 text-granit-doux">
                  <IconFile className="size-7" />
                  <span>{label} : pas encore déposé</span>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </Page>
  );
}
