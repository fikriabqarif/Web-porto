import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Markdown } from "@/components/markdown";
import { TagList } from "@/components/tag-list";
import { pageMetadata, site } from "@/content/profile";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type PageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = await prisma.project.findFirst({ where: { slug, published: true } });
  if (!project) return { title: "Project not found" };

  return pageMetadata({
    title: project.title,
    description: project.summary,
    path: `/projects/${project.slug}`,
  });
}

export default async function ProjectDetailPage({ params }: PageProps) {
  const { slug } = await params;

  const project = await prisma.project.findFirst({
    where: { slug, published: true },
    include: { images: { orderBy: { sortOrder: "asc" } } },
  });

  if (!project) notFound();

  const siblings = await prisma.project.findMany({
    where: { published: true },
    orderBy: { createdAt: "desc" },
    select: { slug: true, title: true },
  });

  const index = siblings.findIndex((item) => item.slug === project.slug);
  const newer = index > 0 ? siblings[index - 1] : undefined;
  const older = index >= 0 ? siblings[index + 1] : undefined;

  return (
    <article className="mx-auto w-full max-w-5xl px-6">
      <header className="space-y-6 border-b border-border py-16">
        <Link href="/projects" className="label link-underline">
          ← All projects
        </Link>
        <h1 className="max-w-3xl text-3xl font-bold leading-tight tracking-tight sm:text-5xl">{project.title}</h1>
        <p className="max-w-2xl text-base leading-relaxed text-muted">{project.summary}</p>
        <dl className="flex flex-wrap gap-x-10 gap-y-4">
          {project.role ? (
            <div className="space-y-1">
              <dt className="label">Role</dt>
              <dd className="text-sm text-foreground">{project.role}</dd>
            </div>
          ) : null}
          <div className="space-y-1">
            <dt className="label">Year</dt>
            <dd className="text-sm text-foreground">{project.createdAt.getFullYear()}</dd>
          </div>
        </dl>
        <TagList tags={project.tags} />
        {(project.githubUrl || project.demoUrl) && (
          <div className="flex flex-wrap gap-3">
            {project.githubUrl ? (
              <a href={project.githubUrl} className="btn-secondary" target="_blank" rel="noreferrer noopener">
                GitHub
              </a>
            ) : null}
            {project.demoUrl ? (
              <a href={project.demoUrl} className="btn-secondary" target="_blank" rel="noreferrer noopener">
                Live demo
              </a>
            ) : null}
          </div>
        )}
      </header>

      {project.images.length > 0 ? (
        <section className="space-y-4 border-b border-border py-10" aria-label="Project images">
          {project.images.map((image, imageIndex) => (
            <figure key={image.id} className="space-y-2">
              <div className="relative aspect-[16/10] w-full border border-border bg-muted/10">
                <Image
                  src={image.url}
                  alt={image.alt}
                  fill
                  sizes="(min-width: 1024px) 1024px, 100vw"
                  className="object-cover"
                  priority={imageIndex === 0}
                />
              </div>
              {image.alt ? <figcaption className="label">{image.alt}</figcaption> : null}
            </figure>
          ))}
        </section>
      ) : null}

      <section className="border-b border-border py-12">
        <Markdown>{project.description}</Markdown>
      </section>

      <nav aria-label="Project navigation" className="grid gap-px py-12 sm:grid-cols-2">
        <div>
          {newer ? (
            <Link href={`/projects/${newer.slug}`} className="group block space-y-1 border border-border p-6 hover:border-foreground">
              <span className="label">Previous</span>
              <span className="block text-base font-bold tracking-tight group-hover:underline group-hover:underline-offset-4">
                {newer.title}
              </span>
            </Link>
          ) : null}
        </div>
        <div>
          {older ? (
            <Link href={`/projects/${older.slug}`} className="group block space-y-1 border border-border p-6 text-right hover:border-foreground">
              <span className="label">Next</span>
              <span className="block text-base font-bold tracking-tight group-hover:underline group-hover:underline-offset-4">
                {older.title}
              </span>
            </Link>
          ) : null}
        </div>
      </nav>

      <p className="pb-16">
        <Link href="/contact" className="label link-underline">
          Questions about this project? Get in touch — {site.email}
        </Link>
      </p>
    </article>
  );
}
