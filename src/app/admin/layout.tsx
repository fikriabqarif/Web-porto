import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { logout } from "@/actions/auth";
import { AdminNav } from "@/components/admin/admin-nav";
import { ThemeToggle } from "@/components/theme-toggle";
import { auth } from "@/auth";
import { site } from "@/content/profile";
import { ADMIN_LOGIN_PATH, adminHref } from "@/lib/admin-path";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect(`${ADMIN_LOGIN_PATH}?from=${encodeURIComponent(adminHref())}`);

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-border">
        <div className="mx-auto flex w-full max-w-5xl flex-wrap items-center justify-between gap-4 px-6 py-4">
          <div className="flex items-center gap-6">
            <Link
              href={adminHref()}
              className="text-sm font-bold tracking-tight underline-offset-4 hover:underline"
            >
              {site.shortName} / Admin
            </Link>
            <Link href="/" className="label link-underline">
              View site
            </Link>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <form action={logout}>
              <button type="submit" className="btn-quiet">
                Sign out
              </button>
            </form>
          </div>
        </div>
      </header>

      <AdminNav />

      <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-12">{children}</main>
    </div>
  );
}
