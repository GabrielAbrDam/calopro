"use client";

import { useState, useTransition } from "react";
import { regenerateLink } from "@/app/actions";
import { CopyLink } from "@/components/copy-link";
import { IconRefresh } from "@/components/icons";

export function RegenerateLink({ stayId }: { stayId: string }) {
  const [link, setLink] = useState<string | null>(null);
  const [pending, start] = useTransition();
  return (
    <div className="mt-3 space-y-2">
      {link && (
        <>
          <p className="text-sm text-emeraude-fonce">Nouveau lien envoyé au locataire.</p>
          <CopyLink url={link} />
        </>
      )}
      <button className="btn btn-secondaire w-full" disabled={pending} onClick={() => start(async () => setLink(await regenerateLink(stayId)))}>
        <IconRefresh className="size-5" /> Régénérer et renvoyer le lien
      </button>
    </div>
  );
}
