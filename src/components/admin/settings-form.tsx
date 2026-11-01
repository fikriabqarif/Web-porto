"use client";

import { useActionState } from "react";
import { saveSettings } from "@/actions/settings";
import { idleState } from "@/lib/form-state";

type SettingsValues = {
  contactEmail: string;
  github: string;
  linkedin: string;
  instagram: string;
};

export function SettingsForm({ initial }: { initial: SettingsValues }) {
  const [state, formAction, pending] = useActionState(saveSettings, idleState);
  const errors = state.errors ?? {};

  return (
    <form action={formAction} className="space-y-6">
      {state.message ? (
        <p
          role={state.status === "error" ? "alert" : "status"}
          className={state.status === "error" ? "field-error border border-danger p-3" : "border border-border p-3 text-sm"}
        >
          {state.message}
        </p>
      ) : null}

      <div className="space-y-2">
        <label htmlFor="contactEmail" className="label block">
          Contact email
        </label>
        <input
          id="contactEmail"
          name="contactEmail"
          type="email"
          className="input"
          defaultValue={initial.contactEmail}
          aria-invalid={Boolean(errors.contactEmail)}
        />
        {errors.contactEmail ? <p className="field-error">{errors.contactEmail}</p> : null}
      </div>

      <fieldset className="space-y-4 border border-border p-4">
        <legend className="label px-2">Social links</legend>

        {(
          [
            { name: "github", label: "GitHub", value: initial.github },
            { name: "linkedin", label: "LinkedIn", value: initial.linkedin },
            { name: "instagram", label: "Instagram", value: initial.instagram },
          ] as const
        ).map((field) => (
          <div key={field.name} className="space-y-2">
            <label htmlFor={field.name} className="label block">
              {field.label}
            </label>
            <input
              id={field.name}
              name={field.name}
              className="input"
              defaultValue={field.value}
              placeholder="https://"
              aria-invalid={Boolean(errors[field.name])}
            />
            {errors[field.name] ? <p className="field-error">{errors[field.name]}</p> : null}
          </div>
        ))}
      </fieldset>

      <button type="submit" className="btn-primary" disabled={pending}>
        {pending ? "Saving…" : "Save settings"}
      </button>
    </form>
  );
}
