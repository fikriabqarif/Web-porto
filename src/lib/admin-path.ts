/**
 * The admin area never shows up at an obvious URL. Real routes stay under
 * `/admin` (hidden and 404'd by middleware); the only way in is the value of
 * ADMIN_SECRET_PATH, which is normalised here and exposed to the client bundle
 * as NEXT_PUBLIC_ADMIN_PATH by next.config.ts.
 *
 * Changing the path = change ADMIN_SECRET_PATH and rebuild.
 */
const raw = (process.env.NEXT_PUBLIC_ADMIN_PATH ?? "/admin").trim().replace(/\/+$/, "");

export const ADMIN_BASE = raw === "" ? "/admin" : raw;

export const ADMIN_LOGIN_PATH = `${ADMIN_BASE}/login`;

/** Build a visible (secret-prefixed) admin URL: adminHref("/projects"). */
export function adminHref(path = ""): string {
  if (!path || path === "/") return ADMIN_BASE;
  return `${ADMIN_BASE}${path.startsWith("/") ? path : `/${path}`}`;
}
