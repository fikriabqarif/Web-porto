"use client";

import { useActionState } from "react";
import { submitContact } from "@/actions/contact";
import { idleState } from "@/lib/form-state";

export function ContactForm() {
  const [state, formAction, pending] = useActionState(submitContact, idleState);
  const errors = state.errors ?? {};

  if (state.status === "success") {
    return (
      <div role="status" className="space-y-3 border border-border p-6">
        <p className="text-base font-medium text-foreground">{state.message}</p>
        <p className="text-sm text-muted">I usually reply within a few days.</p>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-6" noValidate>
      {state.status === "error" && state.message ? (
        <p role="alert" className="field-error">
          {state.message}
        </p>
      ) : null}

      <div className="space-y-2">
        <label htmlFor="name" className="label block">
          Name
        </label>
        <input
          id="name"
          name="name"
          type="text"
          autoComplete="name"
          required
          className="input"
          aria-invalid={Boolean(errors.name)}
          aria-describedby={errors.name ? "name-error" : undefined}
        />
        {errors.name ? (
          <p id="name-error" className="field-error">
            {errors.name}
          </p>
        ) : null}
      </div>

      <div className="space-y-2">
        <label htmlFor="email" className="label block">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          className="input"
          aria-invalid={Boolean(errors.email)}
          aria-describedby={errors.email ? "email-error" : undefined}
        />
        {errors.email ? (
          <p id="email-error" className="field-error">
            {errors.email}
          </p>
        ) : null}
      </div>

      <div className="space-y-2">
        <label htmlFor="body" className="label block">
          Message
        </label>
        <textarea
          id="body"
          name="body"
          rows={7}
          required
          className="textarea"
          aria-invalid={Boolean(errors.body)}
          aria-describedby={errors.body ? "body-error" : undefined}
        />
        {errors.body ? (
          <p id="body-error" className="field-error">
            {errors.body}
          </p>
        ) : null}
      </div>

      {/* Honeypot: hidden from humans, catnip for bots. */}
      <div aria-hidden="true" className="absolute -left-[9999px] top-auto h-px w-px overflow-hidden">
        <label htmlFor="website">Website</label>
        <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <button type="submit" className="btn-primary" disabled={pending}>
          {pending ? "Sending…" : "Send message"}
        </button>
        <p className="text-xs text-muted">No newsletters, no tracking — just a reply.</p>
      </div>
    </form>
  );
}
