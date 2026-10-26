"use client";

import Link from "next/link";
import { useActionState } from "react";
import { createStayFromApplication } from "@/app/actions";
import { CopyLink } from "@/components/copy-link";

export function CreateStayForm(props: { applicationId: string; start: string; end: string; rent: number; charges: number }) {
  const [state, action, pending] = useActionState(createStayFromApplication, null);

  if (state?.link)
    return (
      <div className="space-y-3">
        <p className="text-emeraude-fonce">Séjour créé. Le lien « Mon séjour » vient de partir par mail.</p>
        <CopyLink url={state.link} />
        <Link href={`/proprio/sejours/${state.stayId}`} className="btn btn-primaire w-full">
          Déposer les documents
        </Link>
      </div>
    );

  return (
    <form action={action} className="space-y-3">
      <input type="hidden" name="application_id" value={props.applicationId} />
      <div className="grid grid-cols-2 gap-3">
        <label>
          <span className="mb-1 block text-sm font-semibold">Entrée</span>
          <input type="date" name="start_date" defaultValue={props.start} className="champ" required />
        </label>
        <label>
          <span className="mb-1 block text-sm font-semibold">Sortie</span>
          <input type="date" name="end_date" defaultValue={props.end} className="champ" required />
        </label>
        <label>
          <span className="mb-1 block text-sm font-semibold">Loyer (€)</span>
          <input type="number" name="rent" defaultValue={props.rent} className="champ" required />
        </label>
        <label>
          <span className="mb-1 block text-sm font-semibold">Forfait (€)</span>
          <input type="number" name="charges" defaultValue={props.charges} className="champ" required />
        </label>
      </div>
      <label className="block">
        <span className="mb-1 block text-sm font-semibold">Code de la boîte à clés</span>
        <input name="key_box_code" inputMode="numeric" pattern="\d{4,6}" className="champ tracking-[0.3em]" required />
        <span className="mt-1 block text-xs text-granit-doux">Visible par le locataire le jour d'entrée seulement, jamais envoyé par mail.</span>
      </label>
      {state?.error && <p className="text-sm font-semibold text-alerte">{state.error}</p>}
      <button className="btn btn-primaire w-full" disabled={pending}>
        {pending ? "Création…" : "Créer le séjour et envoyer le lien"}
      </button>
    </form>
  );
}
