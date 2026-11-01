import type { Metadata } from "next";
import Link from "next/link";
import { TagList } from "@/components/tag-list";
import { pageMetadata, site } from "@/content/profile";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export const metadata: Metadata = pageMetadata({
  title: "Notes",
  description: `Notes on electronics, embedded systems and measurement by ${site.name}.`,
  path: "/notes",
});

export default async function NotesPage() {
  const posts = await prisma.post.findMany({
    where: { published: true },
    orderBy: { publishedAt: "desc" },
  });

  return (
    <div className="mx-auto w-full max-w-5xl px-6">
      <header className="space-y-4 border-b border-border py-16">
        <p className="label">Index</p>
        <h1 className="text-3xl font-bold tracking-tight sm:text-5xl">Notes</h1>
        <p className="max-w-2xl text-sm leading-relaxed text-muted">
          Short working notes — things I had to figure out, written down while the details were still fresh.
        </p>
      </header>

      <section className="py-8">
        {posts.length === 0 ? (
          <p className="py-8 text-sm text-muted">No published notes yet.</p>
        ) : (
          <ul className="divide-y divide-border">
            {posts.map((post) => (
              <li key={post.id}>
                <Link href={`/notes/${post.slug}`} className="group block space-y-3 py-8">
                  <div className="flex flex-wrap items-center gap-3">
                    <time className="label" dateTime={post.publishedAt.toISOString()}>
                      {post.publishedAt.toLocaleDateString("en-GB", {
                        year: "numeric",
                        month: "short",
                        day: "2-digit",
                      })}
                    </time>
                    <TagList tags={post.tags} />
                  </div>
                  <h2 className="text-xl font-bold tracking-tight text-foreground underline-offset-4 group-hover:underline sm:text-2xl">
                    {post.title}
                  </h2>
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
