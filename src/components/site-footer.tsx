import { site } from "@/content/profile";
import { getSettings } from "@/lib/settings";

export async function SiteFooter() {
  const settings = await getSettings(site.email);
  const socials = [
    { label: "GitHub", href: settings.socials.github || site.github },
    { label: "LinkedIn", href: settings.socials.linkedin || site.linkedin },
  ].filter((item) => item.href);

  if (settings.socials.instagram) {
    socials.push({ label: "Instagram", href: settings.socials.instagram });
  }

  return (
    <footer className="mt-24 border-t border-border">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-6 py-10 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <p className="text-sm font-medium text-foreground">{site.name}</p>
          <p className="text-sm text-muted">{site.location}</p>
        </div>

        <nav aria-label="Social links">
          <ul className="flex flex-wrap gap-5">
            {socials.map((item) => (
              <li key={item.label}>
                <a
                  href={item.href}
                  className="label underline-offset-4 transition-colors duration-150 hover:text-foreground hover:underline"
                  rel="noreferrer noopener"
                  target="_blank"
                >
                  {item.label}
                </a>
              </li>
            ))}
            <li>
              <a
                href={`mailto:${settings.contactEmail}`}
                className="label underline-offset-4 transition-colors duration-150 hover:text-foreground hover:underline"
              >
                Email
              </a>
            </li>
          </ul>
        </nav>
      </div>
    </footer>
  );
}
