"use client";

import { useActionState } from "react";
import { addArrivalPhotos } from "@/app/actions";
import { IconCamera } from "@/components/icons";

const ROOMS = ["Entrée", "Pièce de vie", "Chambre", "Cuisine", "Salle d'eau", "Autre"];

export function ArrivalPhotos({ token }: { token: string }) {
  const [state, action, pending] = useActionState(addArrivalPhotos.bind(null, token), null);
  return (
    <form action={action} className="mt-3 space-y-3">
      <select name="room" className="champ" aria-label="Pièce">
        {ROOMS.map((r) => (
          <option key={r}>{r}</option>
        ))}
      </select>
      <input name="photos" type="file" accept="image/*" multiple capture="environment" className="champ py-3" aria-label="Photos" />
      <button type="submit" disabled={pending} className="btn btn-secondaire w-full">
        <IconCamera className="size-5" /> {pending ? "Ajout…" : "Ajouter les photos"}
      </button>
      {state && "error" in state && <p className="text-sm text-alerte">{state.error}</p>}
      {state && "ok" in state && <p className="text-sm text-emeraude-fonce">Photos ajoutées.</p>}
    </form>
  );
}
