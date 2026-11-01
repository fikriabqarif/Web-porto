import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { ADMIN_LOGIN_PATH } from "@/lib/admin-path";

/**
 * Edge-safe base config. No Prisma, no bcrypt: the middleware imports this file
 * and only needs to decode the JWT sitting in the session cookie.
 */
export const authConfig = {
  trustHost: true,
  pages: { signIn: ADMIN_LOGIN_PATH },
  session: { strategy: "jwt", maxAge: 30 * 24 * 60 * 60 },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      // The real check is installed in src/auth.ts (node runtime).
      authorize: () => null,
    }),
  ],
} satisfies NextAuthConfig;
