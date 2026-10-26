"use client";

import { startTransition, useActionState, useState } from "react";
import { reportIncident } from "@/app/actions";

export function ReportForm({
  token,
  equipment,
  equipmentChoices,
}: {
  token?: string;
  equipment?: { slug: string; name: string };
  equipmentChoices?: { slug: string; name: string }[];
}) {
  const [state, action, pending] = useActionState(reportIncident, null);
  const [key, setKey] = useState(0);
  const [dismissed, setDismissed] = useState<typeof state>(null);

  if (state?.ok && state !== dismissed)
    return (
      <div className="rounded-2xl bg-emeraude-clair p-4 text-emeraude-fonce" role="status">
        <p className="font-semibold">Signalement envoyé.</p>
        <p className="mt-1 text-sm">Le propriétaire est prévenu. Vous suivrez son traitement dans l'onglet Signaler de « Mon séjour ».</p>
        <button type="button" className="btn btn-secondaire mt-3" onClick={() => {
            setDismissed(state);
            setKey((k) => k + 1);
          }}>
          Signaler autre chose
        </button>
      </div>
    );

  return (
    <form
      key={key}
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        startTransition(() => action(fd));
      }}
    >
      {token && <input type="hidden" name="token" value={token} />}
      {equipment ? (
        <>
          <input type="hidden" name="equipment" value={equipment.slug} />
          <p className="rounded-xl bg-sable px-3 py-2 text-sm">
            Équipement : <strong>{equipment.name}</strong>
          </p>
        </>
      ) : (
        equipmentChoices && (
          <label className="block">
            <span className="mb-1 block font-semibold">Ça concerne</span>
            <select name="equipment" className="champ">
              <option value="">Autre chose dans le logement</option>
              {equipmentChoices.map((e) => (
                <option key={e.slug} value={e.slug}>
                  {e.name}
                </option>
              ))}
            </select>
          </label>
        )
      )}
      <label className="block">
        <span className="mb-1 block font-semibold">Que se passe-t-il ?</span>
        <textarea name="description" rows={4} className="champ" placeholder="Depuis quand, ce que vous avez déjà essayé… (vide = texte de démo)" />
      </label>
      <label className="block">
        <span className="mb-1 block font-semibold">Photos (3 au plus)</span>
        <input name="photos" type="file" accept="image/*" multiple capture="environment" className="champ py-3" />
      </label>
      <fieldset>
        <legend className="mb-2 font-semibold">Urgence</legend>
        <div className="grid grid-cols-2 gap-2">
          <label className="flex min-h-12 items-center gap-2 rounded-xl border-[1.5px] border-trait bg-blanc px-3 has-[:checked]:border-emeraude">
            <input type="radio" name="urgency" value="normale" defaultChecked className="size-5 accent-emeraude" /> Peut attendre
          </label>
          <label className="flex min-h-12 items-center gap-2 rounded-xl border-[1.5px] border-trait bg-blanc px-3 has-[:checked]:border-alerte">
            <input type="radio" name="urgency" value="urgente" className="size-5 accent-alerte" /> Urgent
          </label>
        </div>
      </fieldset>
      {state?.error && (
        <p className="rounded-xl bg-alerte-clair p-3 text-sm font-semibold text-alerte" role="alert">
          {state.error}
        </p>
      )}
      <button type="submit" disabled={pending} className="btn btn-primaire w-full">
        {pending ? "Envoi…" : "Envoyer le signalement"}
      </button>
    </form>
  );
}

export function EmergencyNumbers() {
  const nums = [
    { label: "Urgences", n: "112" },
    { label: "Urgence gaz", n: "0 800 47 33 33" },
    { label: "Panne électrique", n: "09 726 750 35" },
  ];
  return (
    <ul className="grid grid-cols-3 gap-2">
      {nums.map((x) => (
        <li key={x.n}>
          <a href={`tel:${x.n.replace(/\s/g, "")}`} className="flex min-h-16 flex-col justify-center rounded-xl bg-alerte-clair px-2 text-center text-alerte">
            <span className="text-xs font-medium">{x.label}</span>
            <span className="text-sm font-bold tabular-nums">{x.n}</span>
          </a>
        </li>
      ))}
    </ul>
  );
}
