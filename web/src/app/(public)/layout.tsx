import { TabBar } from "@/components/tab-bar";
import { IconBuilding, IconScale, IconSearch } from "@/components/icons";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <TabBar
        tabs={[
          { href: "/logements", label: "Logements", icon: <IconBuilding /> },
          { href: "/conditions", label: "Conditions", icon: <IconScale /> },
          { href: "/suivi", label: "Ma demande", icon: <IconSearch /> },
        ]}
      />
    </>
  );
}
