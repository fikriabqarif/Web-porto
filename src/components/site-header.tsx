import Link from "next/link";
import { MobileNav } from "@/components/mobile-nav";
import { NavLink, NAV_LINKS } from "@/components/nav-links";
import { ThemeToggle } from "@/components/theme-toggle";
import { site } from "@/content/profile";

export function SiteHeader() {
  return (
    <header className="border-b border-border">
      <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-6 px-6 py-5">
        <Link
          href="/"
          className="text-sm font-bold tracking-tight text-foreground underline-offset-4 hover:underline"
        >
          {site.shortName}
          <span className="text-muted"> — {site.identityLine}</span>
        </Link>

        <div className="flex items-center gap-6">
          <nav aria-label="Main" className="hidden md:block">
            <ul className="flex items-center gap-6">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <NavLink href={link.href} label={link.label} />
                </li>
              ))}
            </ul>
          </nav>
          <ThemeToggle />
          <MobileNav />
        </div>
      </div>
    </header>
  );
}
