"use client";

import { useActionState, useState } from "react";
import { resendStayLink } from "./actions";

export function ResendLinkForm() {
  const [open, setOpen] = useState(false);
  const [state, action, pending] = useActionState(resendStayLink, null);

  if (!open)
    return (
      <button type="button" onClick={() => setOpen(true)} className="btn btn-secondaire min-h-16 w-full text-lg">
        Je suis déjà locataire
      </button>
    );

  return (
    <form action={action} className="rounded-2xl bg-blanc p-4">
      <label htmlFor="email" className="block font-semibold">
        Votre adresse mail
      </label>
      <p className="mb-3 text-sm text-granit-doux">Celle du bail. On vous renvoie votre lien « Mon séjour ».</p>
      <input id="email" name="email" type="email" required autoComplete="email" className="champ" />
      <button type="submit" disabled={pending} className="btn btn-primaire mt-3 w-full">
        {pending ? "Envoi…" : "Recevoir mon lien"}
      </button>
      {state && <p className="mt-3 text-sm text-emeraude-fonce" role="status">{state}</p>}
    </form>
  );
}
