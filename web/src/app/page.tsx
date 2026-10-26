import Link from "next/link";
import { listProperties } from "@/lib/data";
import { eur } from "@/lib/format";
import { ResendLinkForm } from "./resend-link-form";

export default async function Accueil() {
  const props = await listProperties();
  const min = Math.min(...props.map((p) => p.rent + p.charges));

  return (
    <main className="mx-auto flex min-h-dvh max-w-xl flex-col">
      <section className="relative overflow-hidden bg-emeraude-fonce px-5 pt-12 pb-16 text-white">
        <svg viewBox="0 0 400 120" className="absolute inset-x-0 bottom-0 w-full text-ecume" preserveAspectRatio="none" aria-hidden>
          <path d="M0 70 C 60 40, 120 100, 200 70 S 340 40, 400 70 V120 H0z" fill="currentColor" />
        </svg>
        <p className="relative text-sm font-medium text-white/75">Calopro</p>
        <h1 className="titre relative mt-3 text-[3.4rem]">
          Trois meublés à Saint-Malo, de 1 à 10 mois.
        </h1>
        <p className="relative mt-4 max-w-sm text-lg leading-snug text-white/85">
          Bail mobilité, sans dépôt de garantie, à partir de {eur(min)} par mois charges comprises.
        </p>
      </section>

      <div className="flex flex-1 flex-col gap-3 px-5 pt-2 pb-10">
        <Link href="/logements" className="btn btn-primaire min-h-16 w-full text-lg">
          Je souhaite louer
        </Link>
        <ResendLinkForm />

        <ul className="mt-6 space-y-3 text-granit-doux">
          <li>Visite en vidéo de chaque logement, sans vous déplacer.</li>
          <li>Candidature en trois étapes, avec votre dossier DossierFacile.</li>
          <li>Arrivée autonome avec boîte à clés et parcours guidé.</li>
        </ul>

        <p className="mt-auto pt-10 text-center text-sm text-granit-doux">
          <Link href="/demo" className="underline underline-offset-4">Accès de démonstration</Link>
          {" · "}
          <Link href="/proprio" className="underline underline-offset-4">Espace propriétaire</Link>
        </p>
      </div>
    </main>
  );
}
