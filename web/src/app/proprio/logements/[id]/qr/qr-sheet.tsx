"use client";

import { IconPrinter } from "@/components/icons";

type Item = { label: string; sub: string; url: string; svg: string };

export function QrSheet({ title, items }: { title: string; items: Item[] }) {
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
          {items.map((it) => (
            <li key={it.url} className="break-inside-avoid rounded-xl border-2 border-dashed border-trait p-3 text-center">
              <div className="mx-auto aspect-square w-full max-w-[150px]" dangerouslySetInnerHTML={{ __html: it.svg }} />
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
