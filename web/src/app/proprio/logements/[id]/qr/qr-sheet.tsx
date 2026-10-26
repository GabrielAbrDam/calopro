"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { IconPrinter } from "@/components/icons";

type Item = { label: string; sub: string; url: string };

export function QrSheet({ title, items }: { title: string; items: Item[] }) {
  const [svgs, setSvgs] = useState<string[]>([]);

  useEffect(() => {
    Promise.all(
      items.map((i) => QRCode.toString(i.url, { type: "svg", margin: 0, errorCorrectionLevel: "M", color: { dark: "#22303a", light: "#ffffff" } })),
    ).then(setSvgs);
  }, [items]);

  return (
    <>
      <div className="no-print px-4 pb-4">
        <button type="button" onClick={() => window.print()} className="btn btn-primaire w-full">
          <IconPrinter className="size-5" /> Imprimer ou enregistrer en PDF
        </button>
      </div>
      <style>{`@page { size: A4; margin: 12mm; }`}</style>
      <section className="mx-4 bg-white p-6 print:m-0 print:p-0">
        <h2 className="titre mb-4 text-3xl">{title}</h2>
        <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 print:grid-cols-3">
          {items.map((it, i) => (
            <li key={it.url} className="break-inside-avoid rounded-xl border-2 border-dashed border-trait p-3 text-center">
              <div className="mx-auto aspect-square w-full max-w-[150px]" dangerouslySetInnerHTML={{ __html: svgs[i] ?? "" }} />
              <p className="mt-2 font-bold leading-tight">{it.label}</p>
              <p className="text-xs text-granit-doux">{it.sub}</p>
              <p className="mt-1 text-[0.65rem] text-granit-doux">Scannez pour la notice</p>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
