"use client";

import { startTransition, useActionState, useRef, useState } from "react";
import { submitApplication } from "@/app/actions";
import { checkLeaseDates, dateLong, LEASE_RULES, monthsBetween } from "@/lib/format";

const STEPS = ["Dates et motif", "Votre dossier", "Envoi"];

export function ApplyForm({ slug, minDate }: { slug: string; minDate: string }) {
  const [step, setStep] = useState(0);
  // Valeurs par défaut : la démo se parcourt sans rien saisir.
  const [start, setStart] = useState(minDate);
  const [end, setEnd] = useState(() => {
    const d = new Date(minDate);
    d.setMonth(d.getMonth() + 4);
    return d.toISOString().slice(0, 10);
  });
  const [motive, setMotive] = useState("Mission temporaire");
  const [mode, setMode] = useState<"df" | "files">("df");
  const [localError, setLocalError] = useState<string | null>(null);
  const [state, action, pending] = useActionState(submitApplication, null);
  const formRef = useRef<HTMLFormElement>(null);

  const dateError = start && end ? checkLeaseDates(start, end) : null;
  const months = start && end && !dateError ? monthsBetween(start, end) : null;

  function next() {
    setLocalError(null);
    if (step === 0) {
      const err = checkLeaseDates(start, end) ?? (motive ? null : "Choisissez votre motif.");
      if (err) return setLocalError(err);
    }
    if (step === 1) {
      const files = (formRef.current!.elements.namedItem("files") as HTMLInputElement).files;
      if (files && [...files].some((x) => x.size > 10 * 1024 * 1024)) return setLocalError("Chaque pièce doit faire 10 Mo au plus.");
    }
    setStep((s) => s + 1);
  }

  const error = localError ?? state?.error;

  return (
    <form
      ref={formRef}
      className="px-4"
      noValidate
      onSubmit={(e) => {
        // Soumission manuelle : empêche l'envoi avant la dernière étape et évite que React vide le formulaire.
        e.preventDefault();
        if (step < 2) return next();
        setLocalError(null);
        const fd = new FormData(e.currentTarget);
        startTransition(() => action(fd));
      }}
    >
      <input type="hidden" name="property" value={slug} />

      <ol className="mb-5 flex gap-2" aria-label="Étapes">
        {STEPS.map((s, i) => (
          <li key={s} className="flex-1" aria-current={i === step ? "step" : undefined}>
            <span className={`block h-1.5 rounded-full ${i <= step ? "bg-emeraude" : "bg-trait"}`} />
            <span className={`mt-1.5 block text-xs font-semibold ${i === step ? "text-granit" : "text-granit-doux"}`}>
              {i + 1}. {s}
            </span>
          </li>
        ))}
      </ol>

      {/* Étape 1 */}
      <fieldset hidden={step !== 0} className="space-y-4">
        <legend className="sr-only">Dates et motif</legend>
        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="mb-1 block font-semibold">Entrée</span>
            <input type="date" name="start_date" min={minDate} value={start} onChange={(e) => setStart(e.target.value)} className="champ" required />
          </label>
          <label className="block">
            <span className="mb-1 block font-semibold">Sortie</span>
            <input type="date" name="end_date" min={start || minDate} value={end} onChange={(e) => setEnd(e.target.value)} className="champ" required />
          </label>
        </div>
        {months !== null && <p className="text-sm text-emeraude-fonce">Durée : {months} mois.</p>}
        {dateError && <p className="text-sm font-semibold text-alerte">{dateError}</p>}
        <p className="text-sm text-granit-doux">Disponible à partir du {dateLong(minDate)}. Durée de 1 à 10 mois.</p>

        <div>
          <span className="mb-2 block font-semibold">Motif du bail mobilité</span>
          <div className="grid gap-2">
            {LEASE_RULES.motives.map((m) => (
              <label key={m} className={`flex min-h-12 cursor-pointer items-center gap-3 rounded-xl border-[1.5px] bg-blanc px-3 ${motive === m ? "border-emeraude" : "border-trait"}`}>
                <input type="radio" name="motive" value={m} checked={motive === m} onChange={() => setMotive(m)} className="size-5 accent-emeraude" />
                {m}
              </label>
            ))}
          </div>
        </div>
      </fieldset>

      {/* Étape 2 */}
      <fieldset hidden={step !== 1} className="space-y-4">
        <legend className="sr-only">Votre dossier</legend>
        <div className="grid grid-cols-2 gap-3">
          <label>
            <span className="mb-1 block font-semibold">Prénom</span>
            <input name="first_name" autoComplete="given-name" defaultValue="Alex" className="champ" />
          </label>
          <label>
            <span className="mb-1 block font-semibold">Nom</span>
            <input name="last_name" autoComplete="family-name" defaultValue="Martin" className="champ" />
          </label>
        </div>
        <label className="block">
          <span className="mb-1 block font-semibold">Mail</span>
          <input name="email" type="email" autoComplete="email" defaultValue="alex.martin@exemple.fr" className="champ" />
        </label>
        <label className="block">
          <span className="mb-1 block font-semibold">Téléphone</span>
          <input name="phone" type="tel" autoComplete="tel" defaultValue="06 12 34 56 78" className="champ" />
        </label>

        <div role="radiogroup" aria-label="Type de dossier" className="grid grid-cols-2 gap-1 rounded-full bg-sable p-1">
          {(
            [
              ["df", "Lien DossierFacile"],
              ["files", "Pièces à déposer"],
            ] as const
          ).map(([k, l]) => (
            <button
              key={k}
              type="button"
              role="radio"
              aria-checked={mode === k}
              onClick={() => setMode(k)}
              className={`min-h-11 rounded-full text-sm font-semibold ${mode === k ? "bg-blanc text-granit shadow-sm" : "text-granit-doux"}`}
            >
              {l}
            </button>
          ))}
        </div>
        <div hidden={mode !== "df"}>
          <label className="block">
            <span className="mb-1 block font-semibold">Lien de partage DossierFacile</span>
            <input name="dossier_facile_url" type="url" defaultValue="https://locataire.dossierfacile.logement.gouv.fr/file/demo-alex" className="champ" />
          </label>
          <p className="mt-1 text-sm text-granit-doux">
            Pas encore de dossier ? Créez-le gratuitement sur{" "}
            <a href="https://www.dossierfacile.logement.gouv.fr/" target="_blank" rel="noreferrer" className="underline">
              DossierFacile
            </a>
            , le service de l'État.
          </p>
        </div>
        <div hidden={mode !== "files"}>
          <label className="block">
            <span className="mb-1 block font-semibold">Pièces (PDF ou JPG, 10 Mo max chacune)</span>
            <input name="files" type="file" multiple accept=".pdf,.jpg,.jpeg,application/pdf,image/jpeg" className="champ py-3" />
          </label>
          <p className="mt-1 text-sm text-granit-doux">Pièce d'identité, justificatif du motif, garant ou attestation Visale.</p>
        </div>
      </fieldset>

      {/* Étape 3 */}
      <fieldset hidden={step !== 2} className="space-y-4">
        <legend className="sr-only">Envoi</legend>
        <div className="rounded-2xl bg-blanc p-4 text-sm">
          <p>
            Du <strong>{start && dateLong(start)}</strong> au <strong>{end && dateLong(end)}</strong>
            {months !== null && ` (${months} mois)`}
          </p>
          <p className="mt-1 text-granit-doux">{motive}</p>
        </div>
        <label className="block">
          <span className="mb-1 block font-semibold">Un mot pour le propriétaire (facultatif)</span>
          <textarea name="message" rows={4} className="champ" placeholder="Votre situation, votre employeur ou école, vos horaires d'arrivée…" />
        </label>
        <label className="flex gap-3 rounded-xl bg-blanc p-3 text-sm">
          <input type="checkbox" name="consent" defaultChecked className="mt-0.5 size-5 shrink-0 accent-emeraude" />
          <span>
            J'accepte que mes données servent uniquement à étudier cette candidature. Les pièces d'un dossier refusé sont supprimées après 3 mois ;
            je peux demander leur export ou leur suppression à tout moment.
          </span>
        </label>
      </fieldset>

      {error && (
        <p className="mt-4 rounded-xl bg-alerte-clair p-3 text-sm font-semibold text-alerte" role="alert">
          {error}
        </p>
      )}

      <div className="mt-6 flex gap-3">
        {step > 0 && (
          <button type="button" onClick={() => setStep((s) => s - 1)} className="btn btn-secondaire">
            Retour
          </button>
        )}
        {step < 2 ? (
          <button key="next" type="button" onClick={next} className="btn btn-primaire flex-1">
            Continuer
          </button>
        ) : (
          <button key="submit" type="submit" disabled={pending} className="btn btn-primaire flex-1">
            {pending ? "Envoi…" : "Envoyer ma candidature"}
          </button>
        )}
      </div>
    </form>
  );
}
