import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Markdown } from "@/components/markdown";
import { TagList } from "@/components/tag-list";
import { pageMetadata } from "@/content/profile";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type PageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await prisma.post.findFirst({ where: { slug, published: true } });
  if (!post) return { title: "Note not found" };

  return pageMetadata({ title: post.title, description: post.excerpt, path: `/notes/${post.slug}` });
}

export default async function NoteDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const post = await prisma.post.findFirst({ where: { slug, published: true } });

  if (!post) notFound();

  return (
    <article className="mx-auto w-full max-w-3xl px-6">
      <header className="space-y-5 border-b border-border py-16">
        <Link href="/notes" className="label link-underline">
          ← All notes
        </Link>
        <h1 className="text-3xl font-bold leading-tight tracking-tight sm:text-4xl">{post.title}</h1>
        <div className="flex flex-wrap items-center gap-3">
          <time className="label" dateTime={post.publishedAt.toISOString()}>
            {post.publishedAt.toLocaleDateString("en-GB", { year: "numeric", month: "long", day: "2-digit" })}
          </time>
          <TagList tags={post.tags} />
        </div>
        <p className="text-base leading-relaxed text-muted">{post.excerpt}</p>
      </header>

      <div className="py-12">
        <Markdown>{post.body}</Markdown>
      </div>
    </article>
  );
}
