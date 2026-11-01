"use client";

import { useActionState } from "react";
import { removeCv, uploadCv } from "@/actions/settings";
import { idleState } from "@/lib/form-state";

export function CvForm({ currentUrl }: { currentUrl: string }) {
  const [state, formAction, pending] = useActionState(uploadCv, idleState);
  const errors = state.errors ?? {};

  return (
    <div className="space-y-4">
      {currentUrl ? (
        <p className="text-sm text-muted">
          Current file:{" "}
          <a href={currentUrl} className="link-underline text-foreground" target="_blank" rel="noreferrer">
            {currentUrl}
          </a>
        </p>
      ) : (
        <p className="text-sm text-muted">No CV uploaded yet — the About page hides the download link.</p>
      )}

      <form action={formAction} className="space-y-4">
        {state.message ? (
          <p
            role={state.status === "error" ? "alert" : "status"}
            className={state.status === "error" ? "field-error border border-danger p-3" : "border border-border p-3 text-sm"}
          >
            {state.message}
          </p>
        ) : null}

        <div className="space-y-2">
          <label htmlFor="cv" className="label block">
            PDF file (max 4 MB)
          </label>
          <input
            id="cv"
            name="cv"
            type="file"
            accept="application/pdf"
            className="w-full border border-border bg-background px-3 py-2 text-sm file:mr-3 file:border file border-border file:bg-background file:px-3 file:py-1 file:text-xs file:uppercase file:tracking-[0.1em]"
            aria-invalid={Boolean(errors.cv)}
          />
          {errors.cv ? <p className="field-error">{errors.cv}</p> : null}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button type="submit" className="btn-secondary" disabled={pending}>
            {pending ? "Uploading…" : "Upload CV"}
          </button>
        </div>
      </form>

      {currentUrl ? (
        <form action={removeCv}>
          <button type="submit" className="btn-quiet">
            Remove CV
          </button>
        </form>
      ) : null}
    </div>
  );
}
