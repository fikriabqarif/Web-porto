"use client";

import { useActionState } from "react";
import { login } from "@/actions/auth";
import { idleState } from "@/lib/form-state";

export function LoginForm({ from }: { from: string }) {
  const [state, formAction, pending] = useActionState(login, idleState);

  return (
    <form action={formAction} className="space-y-6">
      <input type="hidden" name="from" value={from} />

      {state.status === "error" && state.message ? (
        <p role="alert" className="field-error">
          {state.message}
        </p>
      ) : null}

      <div className="space-y-2">
        <label htmlFor="email" className="label block">
          Email
        </label>
        <input id="email" name="email" type="email" autoComplete="username" required className="input" />
      </div>

      <div className="space-y-2">
        <label htmlFor="password" className="label block">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className="input"
        />
      </div>

      <button type="submit" className="btn-primary w-full" disabled={pending}>
        {pending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
