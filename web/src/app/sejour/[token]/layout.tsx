import Link from "next/link";
import { getStayByToken } from "@/lib/data";
import { TabBar } from "@/components/tab-bar";
import { IconAlert, IconBook, IconFile, IconHome } from "@/components/icons";
import { Page } from "@/components/ui";

export const metadata = { title: "Mon séjour", robots: { index: false } };

export default async function SejourLayout({ children, params }: { children: React.ReactNode; params: Promise<{ token: string }> }) {
  const { token } = await params;
  const stay = await getStayByToken(token);

  if (!stay)
    return (
      <Page withTabs={false}>
        <div className="px-4 pt-16">
          <h1 className="titre text-[2.4rem]">Ce lien ne fonctionne plus</h1>
          <p className="mt-3 text-granit-doux">
            Il a été remplacé par un lien plus récent, ou votre bail est terminé depuis plus de 15 jours. Demandez un nouveau lien avec l'adresse mail de votre bail.
          </p>
          <Link href="/" className="btn btn-primaire mt-6 w-full">
            Recevoir un nouveau lien
          </Link>
        </div>
      </Page>
    );

  const base = `/sejour/${token}`;
  return (
    <>
      {children}
      <TabBar
        tabs={[
          { href: base, label: "Séjour", icon: <IconHome />, exact: true },
          { href: `${base}/livret`, label: "Livret", icon: <IconBook /> },
          { href: `${base}/signaler`, label: "Signaler", icon: <IconAlert /> },
          { href: `${base}/documents`, label: "Documents", icon: <IconFile /> },
        ]}
      />
    </>
  );
}
