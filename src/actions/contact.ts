"use server";

import { headers } from "next/headers";
import { createContactMessage } from "@/lib/contact";
import { idleState, type FormState } from "@/lib/form-state";
import { getClientIp, rateLimit } from "@/lib/rate-limit";
import { contactSchema, flattenFieldErrors } from "@/lib/validation";

const ONE_HOUR = 60 * 60 * 1000;
const HONEYPOT_SUCCESS: FormState = {
  status: "success",
  message: "Thanks — your message has been sent.",
};

function field(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

export async function submitContact(_previous: FormState = idleState, formData: FormData): Promise<FormState> {
  const parsed = contactSchema.safeParse({
    name: field(formData, "name"),
    email: field(formData, "email"),
    body: field(formData, "body"),
    website: field(formData, "website"),
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: "Please fix the highlighted fields.",
      errors: flattenFieldErrors(parsed.error),
    };
  }

  // Honeypot filled in: pretend everything worked and drop the message.
  if (parsed.data.website.trim().length > 0) return HONEYPOT_SUCCESS;

  const ip = getClientIp(await headers());
  const limit = rateLimit(`contact:${ip}`, 5, ONE_HOUR);
  if (!limit.ok) {
    return { status: "error", message: "Too many messages from this address. Please try again later." };
  }

  const result = await createContactMessage({
    name: parsed.data.name,
    email: parsed.data.email,
    body: parsed.data.body,
  });

  if (!result.ok) return { status: "error", message: result.error };
  return HONEYPOT_SUCCESS;
}
