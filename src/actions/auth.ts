"use server";

import { AuthError } from "next-auth";
import { headers } from "next/headers";
import { signIn, signOut } from "@/auth";
import { ADMIN_BASE, ADMIN_LOGIN_PATH } from "@/lib/admin-path";
import { idleState, type FormState } from "@/lib/form-state";
import { getClientIp, rateLimit } from "@/lib/rate-limit";
import { loginSchema } from "@/lib/validation";

const ONE_HOUR = 60 * 60 * 1000;
const GENERIC_ERROR = "Invalid email or password";

function safeRedirectTarget(value: unknown): string {
  if (typeof value !== "string" || !value.startsWith("/") || value.startsWith("//")) return ADMIN_BASE;
  return value;
}

export async function login(_previous: FormState = idleState, formData: FormData): Promise<FormState> {
  const rawEmail = formData.get("email");
  const rawPassword = formData.get("password");

  const parsed = loginSchema.safeParse({
    email: typeof rawEmail === "string" ? rawEmail : "",
    password: typeof rawPassword === "string" ? rawPassword : "",
  });

  if (!parsed.success) return { status: "error", message: GENERIC_ERROR };

  const ip = getClientIp(await headers());
  const limit = rateLimit(`login:${ip}`, 10, ONE_HOUR);
  if (!limit.ok) {
    return { status: "error", message: "Too many login attempts. Please wait an hour and try again." };
  }

  try {
    await signIn("credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      redirectTo: safeRedirectTarget(formData.get("from")),
    });
  } catch (error) {
    if (error instanceof AuthError) return { status: "error", message: GENERIC_ERROR };
    throw error;
  }

  return idleState;
}

export async function logout(): Promise<void> {
  await signOut({ redirectTo: ADMIN_LOGIN_PATH });
}
