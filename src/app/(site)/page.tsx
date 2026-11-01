import Link from "next/link";
import type { Metadata } from "next";
import { ExperienceList } from "@/components/experience-list";
import { ProjectCard } from "@/components/project-card";
import { TagList } from "@/components/tag-list";
import { experience, marqueeSkills, pageMetadata, site, stats } from "@/content/profile";
import { prisma } from "@/lib/prisma";
import { getSettings } from "@/lib/settings";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  ...pageMetadata({ title: site.name, description: site.tagline, path: "/" }),
  title: { absolute: `${site.name} — ${site.identityLine}` },
};

export default async function HomePage() {
  const [featured, latestFeatured, recentNotes, settings] = await Promise.all([
    prisma.project.findMany({
      where: { published: true, featured: true },
      orderBy: { createdAt: "desc" },
      take: 3,
      include: { images: { orderBy: { sortOrder: "asc" }, take: 1 } },
    }),
    prisma.project.findMany({
      where: { published: true },
      orderBy: { createdAt: "desc" },
      take: 3,
      include: { images: { orderBy: { sortOrder: "asc" }, take: 1 } },
    }),
    prisma.post.findMany({
      where: { published: true },
      orderBy: { publishedAt: "desc" },
      take: 2,
    }),
    getSettings(site.email),
  ]);

  // Fall back to the newest published projects when nothing is marked featured.
  const projects = featured.length > 0 ? featured : latestFeatured;

  return (
    <div className="mx-auto w-full max-w-5xl px-6">
      <section className="space-y-8 py-20 sm:py-28" aria-labelledby="hero-heading">
        <p className="label">{site.location}</p>
        <h1
          id="hero-heading"
          className="max-w-3xl text-4xl font-bold leading-[1.05] tracking-tight text-foreground sm:text-6xl"
        >
          {site.name}
        </h1>
        <div className="max-w-2xl space-y-3">
          <p className="text-lg font-medium text-foreground">{site.identityLine}</p>
          <p className="text-sm leading-relaxed text-muted">{site.university}</p>
          <p className="text-base leading-relaxed text-muted">{site.tagline}</p>
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
          <Link href="/projects" className="btn-primary">
            View Projects
          </Link>
          <Link href="/cv" className="btn-secondary">
            Read CV
          </Link>
          {settings.cvUrl ? (
            <a href={settings.cvUrl} className="btn-secondary" download>
              Download PDF
            </a>
          ) : null}
        </div>
      </section>

      <section className="space-y-8 border-t border-border py-16" aria-labelledby="experience-heading">
        <div className="flex flex-wrap items-baseline justify-between gap-4">
          <h2 id="experience-heading" className="section-title">
            Experience
          </h2>
          <Link href="/about" className="label link-underline">
            Full background
          </Link>
        </div>
        <ExperienceList items={experience.slice(0, 3)} />
      </section>

      <section className="space-y-8 border-t border-border py-16" aria-labelledby="featured-heading">
        <div className="flex flex-wrap items-baseline justify-between gap-4">
          <h2 id="featured-heading" className="section-title">
            Selected projects
          </h2>
          <Link href="/projects" className="label link-underline">
            All projects
          </Link>
        </div>

        {projects.length === 0 ? (
          <p className="text-sm text-muted">No published projects yet.</p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2">
            {projects.map((project) => (
              <ProjectCard
                key={project.id}
                slug={project.slug}
                title={project.title}
                summary={project.summary}
                tags={project.tags}
                image={project.images[0]}
              />
            ))}
          </div>
        )}
      </section>

      <section className="space-y-6 border-t border-border py-16" aria-labelledby="toolbox-heading">
        <h2 id="toolbox-heading" className="section-title">
          Toolbox
        </h2>
        <ul className="flex flex-wrap gap-2">
          {marqueeSkills.map((skill) => (
            <li key={skill} className="border border-border px-3 py-2 text-sm text-foreground">
              {skill}
            </li>
          ))}
        </ul>
      </section>

      <section className="space-y-8 border-t border-border py-16" aria-labelledby="notes-heading">
        <div className="flex flex-wrap items-baseline justify-between gap-4">
          <h2 id="notes-heading" className="section-title">
            Latest notes
          </h2>
          <Link href="/notes" className="label link-underline">
            All notes
          </Link>
        </div>

        {recentNotes.length === 0 ? (
          <p className="text-sm text-muted">No published notes yet.</p>
        ) : (
          <ul className="divide-y divide-border border-y border-border">
            {recentNotes.map((post) => (
              <li key={post.id} className="py-6">
                <Link href={`/notes/${post.slug}`} className="group block space-y-2">
                  <div className="flex flex-wrap items-center gap-3">
                    <time className="label" dateTime={post.publishedAt.toISOString()}>
                      {post.publishedAt.toLocaleDateString("en-GB", { year: "numeric", month: "short", day: "2-digit" })}
                    </time>
                    <TagList tags={post.tags} />
                  </div>
                  <h3 className="text-lg font-bold tracking-tight text-foreground underline-offset-4 group-hover:underline">
                    {post.title}
                  </h3>
                  <p className="max-w-2xl text-sm leading-relaxed text-muted">{post.excerpt}</p>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
