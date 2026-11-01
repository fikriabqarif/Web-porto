import Link from "next/link";

export const NAV_LINKS = [
  { href: "/projects", label: "Projects" },
  { href: "/cv", label: "CV" },
  { href: "/notes", label: "Notes" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
] as const;

export function NavLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="text-sm text-muted underline-offset-4 transition-colors duration-150 hover:text-foreground hover:underline"
    >
      {label}
    </Link>
  );
}
