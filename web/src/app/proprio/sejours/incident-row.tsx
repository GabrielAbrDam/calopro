"use client";

import { useTransition } from "react";
import { changeIncidentStatus } from "@/app/actions";
import { dateTime, incidentStatusLabel } from "@/lib/format";
import type { Incident, IncidentStatus } from "@/lib/types";
import { Pill } from "@/components/ui";

const NEXT: Partial<Record<IncidentStatus, { to: IncidentStatus; label: string }>> = {
  envoye: { to: "pris_en_charge", label: "Prendre en charge" },
  pris_en_charge: { to: "resolu", label: "Marquer résolu" },
};

export function IncidentRow({ incident: i, propertyName, equipmentName }: { incident: Incident; propertyName: string; equipmentName?: string }) {
  const [pending, start] = useTransition();
  const next = NEXT[i.status];
  return (
    <li className={`rounded-2xl bg-blanc p-4 ${i.urgency === "urgente" ? "shadow-[inset_4px_0_0_var(--color-alerte)]" : ""}`}>
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-semibold">
          {propertyName}
          {equipmentName ? ` · ${equipmentName}` : ""}
        </span>
        <Pill tone={i.status === "resolu" ? "ok" : i.status === "pris_en_charge" ? "info" : "attention"}>{incidentStatusLabel[i.status]}</Pill>
      </div>
      <p className="mt-1">{i.description}</p>
      <p className="mt-1 text-xs text-granit-doux">
        {dateTime(i.created_at)} · {i.photos} photo{i.photos > 1 ? "s" : ""} · {i.stay_id ? "depuis Mon séjour" : "depuis un QR public"}
        {i.urgency === "urgente" ? " · urgent" : ""}
      </p>
      {next && (
        <button className="btn btn-secondaire mt-3 min-h-11 w-full text-sm" disabled={pending} onClick={() => start(() => changeIncidentStatus(i.id, next.to))}>
          {next.label}
        </button>
      )}
    </li>
  );
}
