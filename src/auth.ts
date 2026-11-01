import { compare } from "bcryptjs";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { authConfig } from "@/auth.config";

function normalizeEmail(value: unknown): string {
  return typeof value === "string" ? value.trim().toLowerCase() : "";
}

/**
 * Hosting dashboards (Vercel, GitHub Actions secrets, ...) store env vars
 * literally, so a hash pasted straight out of `npm run hash-password` or
 * `.env.example` keeps its `\$` escapes. bcrypt then sees an invalid salt and
 * fails instantly, which surfaces as a plain "Invalid email or password".
 * Accept both forms: raw `$2b$12$...` and escaped `\$2b\$12\$...`.
 */
function normalizePasswordHash(value: unknown): string {
  if (typeof value !== "string") return "";
  return value
    .trim()
    .replace(/^['"]+|['"]+$/g, "")
    .replace(/\\/g, "")
    .trim();
}

const BCRYPT_HASH = /^\$2[aby]\$\d{2}\$[./A-Za-z0-9]{53}$/;

/**
 * Auth.js: one admin account, credentials from env.
 * ADMIN_EMAIL + ADMIN_PASSWORD_HASH (bcrypt). No sign-up, no roles.
 */
export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = normalizeEmail(credentials?.email);
        const password = typeof credentials?.password === "string" ? credentials.password : "";
        const adminEmail = normalizeEmail(process.env.ADMIN_EMAIL);
        const passwordHash = normalizePasswordHash(process.env.ADMIN_PASSWORD_HASH);

        if (!adminEmail || !passwordHash) {
          // Misconfiguration, not a wrong password: make it visible in the host
          // logs instead of silently rejecting every login.
          console.error("[auth] ADMIN_EMAIL and/or ADMIN_PASSWORD_HASH missing or empty");
          return null;
        }

        if (!BCRYPT_HASH.test(passwordHash)) {
          console.error(
            `[auth] ADMIN_PASSWORD_HASH is not a bcrypt hash (length ${passwordHash.length}, starts with ${JSON.stringify(
              passwordHash.slice(0, 4),
            )}); expected $2b$<cost>$<53 chars>`,
          );
          return null;
        }

        if (!email || !password) return null;

        // Always run the hash comparison so a wrong email costs the same time
        // as a wrong password.
        const passwordOk = await compare(password, passwordHash);
        if (!passwordOk || email !== adminEmail) return null;

        return { id: "admin", name: "Admin", email: adminEmail };
      },
    }),
  ],
});
