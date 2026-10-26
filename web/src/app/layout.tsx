import type { Metadata, Viewport } from "next";
import { Archivo } from "next/font/google";
import "./globals.css";
import { SwRegister } from "@/components/sw-register";

const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
  axes: ["wdth"],
});

// Données vivantes (dates relatives, statuts) : rendu à chaque requête.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: { default: "Calopro · Meublés à Saint-Malo", template: "%s · Calopro" },
  description: "Trois meublés à Saint-Malo en bail mobilité : candidature en ligne, livret d'accueil et notices par QR.",
  appleWebApp: { capable: true, title: "Calopro", statusBarStyle: "default" },
};

export const viewport: Viewport = {
  themeColor: "#0b6b5c",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr">
      <body className={`${archivo.variable} antialiased`}>
        {children}
        <SwRegister />
      </body>
    </html>
  );
}
