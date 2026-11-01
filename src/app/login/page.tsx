import type { Metadata } from "next";
import Link from "next/link";
import { LoginForm } from "@/components/login-form";
import { ThemeToggle } from "@/components/theme-toggle";
import { site } from "@/content/profile";
import { ADMIN_BASE } from "@/lib/admin-path";

export const metadata: Metadata = {
  title: "Admin login",
  description: "Private area.",
  robots: { index: false, follow: false },
};

type PageProps = { searchParams: Promise<{ from?: string | string[] }> };

export default async function LoginPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const rawFrom = Array.isArray(params.from) ? params.from[0] : params.from;
  const from = rawFrom && rawFrom.startsWith("/") && !rawFrom.startsWith("//") ? rawFrom : ADMIN_BASE;

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-5xl flex-col px-6">
      <header className="flex items-center justify-between border-b border-border py-5">
        <Link href="/" className="text-sm font-bold tracking-tight underline-offset-4 hover:underline">
          {site.shortName}
        </Link>
        <ThemeToggle />
      </header>

      <main className="flex flex-1 items-center py-16">
        <div className="w-full max-w-sm space-y-8">
          <div className="space-y-2">
            <p className="label">Admin</p>
            <h1 className="text-2xl font-bold tracking-tight">Sign in</h1>
            <p className="text-sm text-muted">Single account. No sign-up.</p>
          </div>

          <LoginForm from={from} />

          <p className="text-xs text-muted">
            <Link href="/" className="link-underline">
              ← Back to the site
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
