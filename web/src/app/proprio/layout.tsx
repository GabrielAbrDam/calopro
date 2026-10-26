import { TabBar } from "@/components/tab-bar";
import { IconBuilding, IconCalendar, IconHome, IconInbox } from "@/components/icons";
import { DemoBanner } from "@/components/ui";

export const metadata = { title: { default: "Propriétaire", template: "%s · Propriétaire" }, robots: { index: false } };

export default function ProprioLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <DemoBanner>Démo sans connexion. En production, accès par lien magique Supabase.</DemoBanner>
      {children}
      <TabBar
        tabs={[
          { href: "/proprio", label: "Accueil", icon: <IconHome />, exact: true },
          { href: "/proprio/logements", label: "Logements", icon: <IconBuilding /> },
          { href: "/proprio/candidatures", label: "Candidatures", icon: <IconInbox /> },
          { href: "/proprio/sejours", label: "Séjours", icon: <IconCalendar /> },
        ]}
      />
    </>
  );
}
