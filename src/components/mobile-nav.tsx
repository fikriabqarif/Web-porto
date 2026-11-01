"use client";

import { useState } from "react";
import Link from "next/link";
import { NAV_LINKS } from "@/components/nav-links";

export function MobileNav() {
  const [open, setOpen] = useState(false);

  return (
    <div className="md:hidden">
      <button
        type="button"
        className="label border border-border px-3 py-2 transition-colors duration-150 hover:border-foreground hover:text-foreground"
        aria-expanded={open}
        aria-controls="mobile-nav"
        onClick={() => setOpen((value) => !value)}
      >
        {open ? "Close" : "Menu"}
      </button>
      <div id="mobile-nav" hidden={!open} className="border-t border-border">
        <ul className="flex flex-col gap-4 py-4">
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="text-sm text-foreground underline-offset-4 hover:underline"
                onClick={() => setOpen(false)}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
