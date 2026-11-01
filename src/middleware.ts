import NextAuth from "next-auth";
import { NextResponse, type NextRequest } from "next/server";
import { authConfig } from "@/auth.config";
import { ADMIN_BASE, ADMIN_LOGIN_PATH } from "@/lib/admin-path";

const { auth } = NextAuth(authConfig);

/** Real routes that must never answer directly. */
const INTERNAL_PATHS = ["/admin", "/login"];

function notFound() {
  return new NextResponse("Not Found", {
    status: 404,
    headers: { "content-type": "text/plain; charset=utf-8" },
  });
}

function rewriteTo(request: NextRequest, pathname: string) {
  const target = new URL(pathname, request.nextUrl.origin);
  target.search = request.nextUrl.search;
  return NextResponse.rewrite(target);
}

/**
 * Two jobs:
 *  1. Hide the implementation: /admin and /login answer with a bare 404.
 *  2. Serve the whole admin area under ADMIN_BASE (rewritten onto /admin,
 *     ADMIN_BASE/login onto /login) and require a session for everything
 *     except the login page itself.
 *
 * Real authorization is still re-checked server-side in every admin layout,
 * server action and API route.
 */
export default auth((request) => {
  const { pathname } = request.nextUrl;
  const underSecretPath = pathname === ADMIN_BASE || pathname.startsWith(`${ADMIN_BASE}/`);

  if (!underSecretPath) {
    const internal = INTERNAL_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`));
    return internal ? notFound() : NextResponse.next();
  }

  const rest = pathname.slice(ADMIN_BASE.length);

  if (rest === "/login") {
    if (request.auth) return NextResponse.redirect(new URL(ADMIN_BASE, request.nextUrl.origin));
    return rewriteTo(request, "/login");
  }

  if (!request.auth) {
    const loginUrl = new URL(ADMIN_LOGIN_PATH, request.nextUrl.origin);
    loginUrl.searchParams.set("from", `${pathname}${request.nextUrl.search}`);
    return NextResponse.redirect(loginUrl);
  }

  return rewriteTo(request, `/admin${rest === "/" ? "" : rest}`);
});

export const config = {
  // Skip Next internals, API routes and static files.
  matcher: ["/((?!_next|api|.*\\..*).*)"],
};
