import { compare } from "bcryptjs";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { authConfig } from "@/auth.config";

function normalizeEmail(value: unknown): string {
  return typeof value === "string" ? value.trim().toLowerCase() : "";
}

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
        const passwordHash = process.env.ADMIN_PASSWORD_HASH ?? "";

        if (!adminEmail || !passwordHash || !email || !password) return null;

        // Always run the hash comparison so a wrong email costs the same time
        // as a wrong password.
        const passwordOk = await compare(password, passwordHash);
        if (!passwordOk || email !== adminEmail) return null;

        return { id: "admin", name: "Admin", email: adminEmail };
      },
    }),
  ],
});
