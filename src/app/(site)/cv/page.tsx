import type { Metadata } from "next";
import Link from "next/link";
import {
  bio,
  education,
  experience,
  highlightProjects,
  organizations,
  pageMetadata,
  site,
  skills,
} from "@/content/profile";

export const metadata: Metadata = pageMetadata({
  title: "CV",
  description: `Curriculum vitae of ${site.name} — ${site.identityLine}. Education, engineering experience, leadership and robotics projects.`,
  path: "/cv",
});

function Section({
  title,
  children,
  id,
}: {
  title: string;
  children: React.ReactNode;
  id: string;
}) {
  return (
    <section className="grid gap-4 border-t border-border py-10 sm:grid-cols-[9rem_1fr] print:py-6" aria-labelledby={id}>
      <h2 id={id} className="label pt-1">
        {title}
      </h2>
      <div className="space-y-8">{children}</div>
    </section>
  );
}

function Entry({
  period,
  title,
  meta,
  bullets,
}: {
  period: string;
  title: string;
  meta: string;
  bullets: string[];
}) {
  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <h3 className="text-base font-bold tracking-tight text-foreground">{title}</h3>
        <p className="label">{period}</p>
      </div>
      <p className="text-sm text-muted">{meta}</p>
      {bullets.length > 0 ? (
        <ul className="space-y-1.5 pt-1">
          {bullets.map((bullet) => (
            <li key={bullet.slice(0, 40)} className="flex gap-3 text-sm leading-relaxed text-muted">
              <span aria-hidden className="mt-[0.65em] h-px w-3 shrink-0 bg-muted" />
              <span>{bullet}</span>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

export default function CvPage() {
  return (
    <div className="mx-auto w-full max-w-4xl px-6 print:max-w-none print:px-0">
      <header className="space-y-5 py-16 print:py-0">
        <div className="flex flex-wrap items-baseline justify-between gap-4">
          <div className="space-y-2">
            <p className="label">Curriculum Vitae</p>
            <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-5xl">{site.name}</h1>
            <p className="text-base font-medium text-foreground">{site.identityLine}</p>
          </div>
          <Link href="/contact" className="btn-quiet print:hidden">
            Contact me
          </Link>
        </div>

        <ul className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted">
          <li>{site.location}</li>
          <li>
            <a className="link-underline" href={`mailto:${site.email}`}>
              {site.email}
            </a>
          </li>
          <li>{site.phone}</li>
          <li>
            <a className="link-underline" href={site.linkedin} target="_blank" rel="noreferrer noopener">
              {site.linkedinHandle}
            </a>
          </li>
          <li>
            <a className="link-underline" href={site.github} target="_blank" rel="noreferrer noopener">
              {site.githubHandle}
            </a>
          </li>
        </ul>
      </header>

      <Section title="Profile" id="cv-profile">
        <div className="space-y-3 text-sm leading-relaxed text-foreground">
          {bio.map((paragraph) => (
            <p key={paragraph.slice(0, 24)}>{paragraph}</p>
          ))}
        </div>
      </Section>

      <Section title="Education" id="cv-education">
        {education.map((item) => (
          <Entry
            key={item.title}
            period={item.period}
            title={item.title}
            meta={[item.place, item.detail].filter(Boolean).join(" · ")}
            bullets={[]}
          />
        ))}
      </Section>

      <Section title="Experience" id="cv-experience">
        {experience.map((item) => (
          <Entry
            key={`${item.org}-${item.role}`}
            period={item.period}
            title={`${item.role} — ${item.org}`}
            meta={item.place}
            bullets={item.bullets}
          />
        ))}
      </Section>

      <Section title="Leadership" id="cv-leadership">
        {organizations.map((item) => (
          <Entry
            key={`${item.org}-${item.role}`}
            period={item.period}
            title={`${item.role} — ${item.org}`}
            meta={item.place}
            bullets={item.bullets}
          />
        ))}
      </Section>

      <Section title="Projects" id="cv-projects">
        {highlightProjects.map((item) => (
          <Entry
            key={item.slug}
            period={item.period}
            title={item.title}
            meta={item.tags.join(" · ")}
            bullets={item.bullets}
          />
        ))}
      </Section>

      <Section title="Skills" id="cv-skills">
        <dl className="grid gap-4 sm:grid-cols-2">
          {skills.map((group) => (
            <div key={group.label} className="space-y-1">
              <dt className="text-sm font-bold text-foreground">{group.label}</dt>
              <dd className="text-sm leading-relaxed text-muted">{group.items.join(", ")}</dd>
            </div>
          ))}
        </dl>
      </Section>

      <footer className="border-t border-border py-8 print:py-4">
        <p className="text-sm text-muted">
          References and project write-ups available on request — write to{" "}
          <a href={`mailto:${site.email}`} className="link-underline text-foreground">
            {site.email}
          </a>
          .
        </p>
      </footer>
    </div>
  );
}
