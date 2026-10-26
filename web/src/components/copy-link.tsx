"use client";

import { useState } from "react";

export function CopyLink({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="flex items-center gap-2 rounded-xl bg-ecume p-2">
      <code className="min-w-0 flex-1 truncate px-1 text-xs">{url}</code>
      <button
        type="button"
        className="min-h-11 shrink-0 rounded-full bg-blanc px-3 text-sm font-semibold"
        onClick={() => navigator.clipboard.writeText(url).then(() => setCopied(true))}
      >
        {copied ? "Copié" : "Copier"}
      </button>
    </div>
  );
}
