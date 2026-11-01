"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { adminHref } from "@/lib/admin-path";

const LINKS = [
  { href: adminHref(), label: "Dashboard" },
  { href: adminHref("/projects"), label: "Projects" },
  { href: adminHref("/posts"), label: "Notes" },
  { href: adminHref("/messages"), label: "Messages" },
  { href: adminHref("/settings"), label: "Settings" },
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="Admin" className="border-b border-border">
      <ul className="mx-auto flex w-full max-w-5xl flex-wrap gap-x-6 gap-y-2 px-6 py-4">
        {LINKS.map((link) => {
          const active =
            link.href === adminHref() ? pathname === link.href : pathname.startsWith(link.href);
          return (
            <li key={link.href}>
              <Link
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={`label underline-offset-4 transition-colors duration-150 hover:text-foreground ${
                  active ? "text-foreground underline" : ""
                }`}
              >
                {link.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
