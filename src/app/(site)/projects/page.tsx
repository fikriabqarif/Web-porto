import type { Metadata } from "next";
import { ProjectCard } from "@/components/project-card";
import { pageMetadata, site } from "@/content/profile";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export const metadata: Metadata = pageMetadata({
  title: "Projects",
  description: `Hardware and software projects by ${site.name}.`,
  path: "/projects",
});

export default async function ProjectsPage() {
  const projects = await prisma.project.findMany({
    where: { published: true },
    orderBy: { createdAt: "desc" },
    include: { images: { orderBy: { sortOrder: "asc" }, take: 1 } },
  });

  return (
    <div className="mx-auto w-full max-w-5xl px-6">
      <header className="space-y-4 border-b border-border py-16">
        <p className="label">Index</p>
        <h1 className="text-3xl font-bold tracking-tight sm:text-5xl">Projects</h1>
        <p className="max-w-2xl text-sm leading-relaxed text-muted">
          Selected hardware and software work — measurement systems, embedded firmware and the boards around them.
        </p>
      </header>

      <section className="py-16">
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
    </div>
  );
}
