import type { Metadata } from "next";
import { ContactForm } from "@/components/contact-form";
import { pageMetadata, site } from "@/content/profile";
import { getSettings } from "@/lib/settings";

export const dynamic = "force-dynamic";

export const metadata: Metadata = pageMetadata({
  title: "Contact",
  description: `Get in touch with ${site.name}.`,
  path: "/contact",
});

export default async function ContactPage() {
  const settings = await getSettings(site.email);

  return (
    <div className="mx-auto w-full max-w-5xl px-6">
      <header className="space-y-4 border-b border-border py-16">
        <p className="label">Contact</p>
        <h1 className="text-3xl font-bold tracking-tight sm:text-5xl">Say hello</h1>
        <p className="max-w-2xl text-sm leading-relaxed text-muted">
          Questions about a project, a measurement problem, or a board that will not boot — send a message and I will
          get back to you.
        </p>
        <p className="text-sm text-foreground">
          Or email directly:{" "}
          <a href={`mailto:${settings.contactEmail}`} className="link-underline">
            {settings.contactEmail}
          </a>
        </p>
      </header>

      <section className="py-12" aria-label="Contact form">
        <div className="max-w-xl">
          <ContactForm />
        </div>
      </section>
    </div>
  );
}
