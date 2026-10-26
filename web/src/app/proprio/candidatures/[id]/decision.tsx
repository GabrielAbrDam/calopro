"use client";

import { useState, useTransition } from "react";
import { changeApplicationStatus } from "@/app/actions";
import type { ApplicationStatus } from "@/lib/types";

type Overlap = { id: string; name: string; dates: string };

export function Decision({ applicationId, status, overlaps }: { applicationId: string; status: ApplicationStatus; overlaps: Overlap[] }) {
  const [confirming, setConfirming] = useState(false);
  const [refuse, setRefuse] = useState<string[]>(overlaps.map((o) => o.id));
  const [pending, start] = useTransition();

  const run = (s: ApplicationStatus, others: string[] = []) => start(() => changeApplicationStatus(applicationId, s, others));

  if (confirming)
    return (
      <div className="rounded-2xl bg-blanc p-4">
        <p className="font-semibold">
          {overlaps.length} autre{overlaps.length > 1 ? "s" : ""} candidature{overlaps.length > 1 ? "s" : ""} sur les mêmes dates. Les refuser ?
        </p>
        <ul className="mt-2 space-y-1">
          {overlaps.map((o) => (
            <li key={o.id}>
              <label className="flex min-h-11 items-center gap-3 text-sm">
                <input
                  type="checkbox"
                  className="size-5 accent-emeraude"
                  checked={refuse.includes(o.id)}
                  onChange={(e) => setRefuse((r) => (e.target.checked ? [...r, o.id] : r.filter((x) => x !== o.id)))}
                />
                <span>
                  <strong>{o.name}</strong>, {o.dates}
                </span>
              </label>
            </li>
          ))}
        </ul>
        <div className="mt-3 flex gap-2">
          <button className="btn btn-secondaire" onClick={() => setConfirming(false)}>
            Annuler
          </button>
          <button className="btn btn-primaire flex-1" disabled={pending} onClick={() => run("acceptee", refuse)}>
            Accepter{refuse.length ? ` et refuser ${refuse.length}` : ""}
          </button>
        </div>
      </div>
    );

  return (
    <div className="grid gap-2">
      <button className="btn btn-primaire" disabled={pending} onClick={() => (overlaps.length ? setConfirming(true) : run("acceptee"))}>
        Accepter
      </button>
      <div className="grid grid-cols-2 gap-2">
        {status === "recue" && (
          <button className="btn btn-secondaire" disabled={pending} onClick={() => run("en_etude")}>
            Passer en étude
          </button>
        )}
        <button className={`btn btn-secondaire text-alerte ${status !== "recue" ? "col-span-2" : ""}`} disabled={pending} onClick={() => run("refusee")}>
          Refuser
        </button>
      </div>
      <p className="text-xs text-granit-doux">Le candidat reçoit un mail à chaque changement de statut.</p>
    </div>
  );
}
