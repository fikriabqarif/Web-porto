import Link from "next/link";
import { notFound } from "next/navigation";
import { ProjectForm } from "@/components/admin/project-form";
import { adminHref } from "@/lib/admin-path";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type PageProps = { params: Promise<{ id: string }> };

export default async function EditProjectPage({ params }: PageProps) {
  const { id } = await params;
  const project = await prisma.project.findUnique({
    where: { id },
    include: { images: { orderBy: { sortOrder: "asc" } } },
  });

  if (!project) notFound();

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <Link href={adminHref("/projects")} className="label link-underline">
          ← Projects
        </Link>
        <h1 className="text-2xl font-bold tracking-tight">Edit project</h1>
        <p className="text-xs text-muted">
          {project.published ? "Published" : "Draft"} · {project.slug}
        </p>
      </header>

      <ProjectForm
        initial={{
          id: project.id,
          title: project.title,
          slug: project.slug,
          summary: project.summary,
          description: project.description,
          role: project.role ?? "",
          tags: project.tags.join(", "),
          githubUrl: project.githubUrl ?? "",
          demoUrl: project.demoUrl ?? "",
          featured: project.featured,
          published: project.published,
          images: project.images.map((image) => ({ url: image.url, alt: image.alt })),
        }}
      />
    </div>
  );
}
