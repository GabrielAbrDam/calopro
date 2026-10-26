"use client";

import { useActionState } from "react";
import { applyDpe, lookupGouv } from "@/app/actions";
import { dateLong } from "@/lib/format";
import { IconRefresh } from "@/components/icons";

export function GouvLookup({ propertyId }: { propertyId: string }) {
  const [state, action, pending] = useActionState(lookupGouv.bind(null, propertyId), null);

  return (
    <div className="mt-3">
      <form action={action}>
        <button className="btn btn-secondaire w-full text-sm" disabled={pending}>
          <IconRefresh className="size-5" /> {pending ? "Interrogation de data.gouv…" : "Actualiser depuis data.gouv"}
        </button>
      </form>
      {state?.error && <p className="mt-2 text-sm text-alerte">{state.error}</p>}
      {state?.geocode && (
        <p className="mt-3 text-sm">
          API Adresse : <strong>{state.geocode.label}</strong> (fiabilité {Math.round(state.geocode.score * 100)} %). Coordonnées mises à jour.
        </p>
      )}
      {state?.dpe && (
        <div className="mt-3">
          <p className="mb-2 text-sm font-semibold">DPE ADEME publiés dans la rue ({state.dpe.length})</p>
          {state.dpe.length === 0 && <p className="text-sm text-granit-doux">Aucun DPE publié pour cette rue.</p>}
          <ul className="space-y-2">
            {state.dpe.map((d) => (
              <li key={d.numero}>
                <form action={applyDpe.bind(null, propertyId)} className="flex items-center gap-2 rounded-xl bg-ecume p-2 text-sm">
                  <input type="hidden" name="label" value={d.label} />
                  <input type="hidden" name="ges" value={d.ges} />
                  <input type="hidden" name="conso" value={d.conso} />
                  <input type="hidden" name="numero" value={d.numero} />
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-blanc font-bold">{d.label}</span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate">{d.address}</span>
                    <span className="text-xs text-granit-doux">
                      {Number.isFinite(d.surface) ? `${d.surface} m² · ` : ""}{d.conso} kWh/m² · {dateLong(d.date)}
                    </span>
                  </span>
                  <button className="min-h-11 shrink-0 rounded-full px-3 font-semibold text-emeraude">Utiliser</button>
                </form>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
