import Link from "next/link";
import { notFound } from "next/navigation";
import { PostForm } from "@/components/admin/post-form";
import { adminHref } from "@/lib/admin-path";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type PageProps = { params: Promise<{ id: string }> };

export default async function EditPostPage({ params }: PageProps) {
  const { id } = await params;
  const post = await prisma.post.findUnique({ where: { id } });

  if (!post) notFound();

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <Link href={adminHref("/posts")} className="label link-underline">
          ← Notes
        </Link>
        <h1 className="text-2xl font-bold tracking-tight">Edit note</h1>
        <p className="text-xs text-muted">
          {post.published ? "Published" : "Draft"} · {post.slug}
        </p>
      </header>

      <PostForm
        initial={{
          id: post.id,
          title: post.title,
          slug: post.slug,
          excerpt: post.excerpt,
          body: post.body,
          tags: post.tags.join(", "),
          published: post.published,
        }}
      />
    </div>
  );
}
