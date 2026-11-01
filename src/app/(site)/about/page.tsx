import type { Metadata } from "next";
import Link from "next/link";
import { ExperienceList } from "@/components/experience-list";
import {
  bio,
  education,
  experience,
  interests,
  organizations,
  pageMetadata,
  site,
  skills,
  stats,
} from "@/content/profile";
import { getSettings } from "@/lib/settings";

export const dynamic = "force-dynamic";

export const metadata: Metadata = pageMetadata({
  title: "About",
  description: `About ${site.name} — ${site.identityLine} at ${site.universityShort}.`,
  path: "/about",
});

export default async function AboutPage() {
  const settings = await getSettings(site.email);

  return (
    <div className="mx-auto w-full max-w-5xl px-6">
      <section className="space-y-6 border-b border-border py-16" aria-labelledby="about-heading">
        <p className="label">About</p>
        <h1 id="about-heading" className="max-w-3xl text-3xl font-bold tracking-tight sm:text-5xl">
          {site.name}
        </h1>
        <p className="text-base font-medium text-foreground">{site.identityLine}</p>
        <p className="max-w-2xl text-sm text-muted">{site.university}</p>
        <div className="max-w-2xl space-y-4 text-base leading-relaxed text-foreground">
          {bio.map((paragraph) => (
            <p key={paragraph.slice(0, 24)}>{paragraph}</p>
          ))}
        </div>

        <dl className="grid max-w-2xl grid-cols-2 gap-px border border-border bg-border sm:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className="space-y-1 bg-background p-4">
              <dt className="text-xl font-bold tracking-tight text-foreground">{stat.value}</dt>
              <dd className="label">{stat.label}</dd>
            </div>
          ))}
        </dl>

        <div className="flex flex-wrap gap-3">
          <Link href="/cv" className="btn-primary">
            Read CV
          </Link>
          {settings.cvUrl ? (
            <a href={settings.cvUrl} className="btn-secondary" download>
              Download PDF
            </a>
          ) : null}
          <Link href="/contact" className="btn-secondary">
            Contact
          </Link>
        </div>
      </section>

      <section className="space-y-6 border-b border-border py-16" aria-labelledby="education-heading">
        <h2 id="education-heading" className="label">
          Education
        </h2>
        <ul className="space-y-8">
          {education.map((item) => (
            <li key={item.title} className="grid gap-2 sm:grid-cols-[10rem_1fr]">
              <p className="label pt-1">{item.period}</p>
              <div className="space-y-1">
                <h3 className="text-lg font-bold tracking-tight text-foreground">{item.title}</h3>
                <p className="text-sm text-muted">{item.place}</p>
                {item.detail ? <p className="text-sm leading-relaxed text-muted">{item.detail}</p> : null}
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className="space-y-6 border-b border-border py-16" aria-labelledby="experience-heading">
        <h2 id="experience-heading" className="label">
          Engineering experience
        </h2>
        <ExperienceList items={experience} />
      </section>

      <section className="space-y-6 border-b border-border py-16" aria-labelledby="leadership-heading">
        <h2 id="leadership-heading" className="label">
          Organisational &amp; leadership
        </h2>
        <ExperienceList items={organizations} />
      </section>

      <section className="space-y-6 border-b border-border py-16" aria-labelledby="interests-heading">
        <h2 id="interests-heading" className="label">
          Focus areas
        </h2>
        <ul className="flex flex-wrap gap-2">
          {interests.map((interest) => (
            <li key={interest} className="border border-border px-3 py-2 text-sm text-foreground">
              {interest}
            </li>
          ))}
        </ul>
      </section>

      <section className="space-y-8 py-16" aria-labelledby="skills-heading">
        <h2 id="skills-heading" className="label">
          Skills
        </h2>
        <div className="grid gap-10 sm:grid-cols-4">
          {skills.map((group) => (
            <div key={group.label} className="space-y-4 border-t border-foreground pt-4">
              <h3 className="text-sm font-bold uppercase tracking-[0.1em] text-foreground">{group.label}</h3>
              <ul className="space-y-2 text-sm text-muted">
                {group.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
