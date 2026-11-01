"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { adminHref } from "@/lib/admin-path";
import { isAdmin } from "@/lib/auth-guard";
import type { FormState } from "@/lib/form-state";
import { prisma } from "@/lib/prisma";
import { flattenFieldErrors, postSchema } from "@/lib/validation";

function text(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

function parseTags(formData: FormData): string[] {
  return text(formData, "tags")
    .split(",")
    .map((tag) => tag.trim())
    .filter((tag) => tag.length > 0);
}

function revalidatePost(slug?: string): void {
  revalidatePath("/");
  revalidatePath("/notes");
  if (slug) revalidatePath(`/notes/${slug}`);
  revalidatePath("/admin/posts");
  revalidatePath("/admin");
  revalidatePath("/sitemap.xml");
}

export async function savePost(_previous: FormState, formData: FormData): Promise<FormState> {
  if (!(await isAdmin())) return { status: "error", message: "Your session has expired. Please log in again." };

  const parsed = postSchema.safeParse({
    title: text(formData, "title"),
    slug: text(formData, "slug"),
    excerpt: text(formData, "excerpt"),
    body: text(formData, "body"),
    tags: parseTags(formData),
    published: formData.getAll("intent").map(String).includes("publish"),
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: "Please fix the highlighted fields.",
      errors: flattenFieldErrors(parsed.error),
    };
  }

  const data = parsed.data;
  const id = text(formData, "id");

  const clash = await prisma.post.findUnique({ where: { slug: data.slug }, select: { id: true } });
  if (clash && clash.id !== id) {
    return { status: "error", message: "Please fix the highlighted fields.", errors: { slug: "That slug is already taken." } };
  }

  try {
    if (id) {
      const current = await prisma.post.findUnique({ where: { id }, select: { published: true } });
      const justPublished = !current?.published && data.published;
      await prisma.post.update({
        where: { id },
        data: {
          slug: data.slug,
          title: data.title,
          excerpt: data.excerpt,
          body: data.body,
          tags: data.tags,
          published: data.published,
          ...(justPublished ? { publishedAt: new Date() } : {}),
        },
      });
    } else {
      await prisma.post.create({
        data: {
          slug: data.slug,
          title: data.title,
          excerpt: data.excerpt,
          body: data.body,
          tags: data.tags,
          published: data.published,
        },
      });
    }
  } catch {
    return { status: "error", message: "Could not save the note. Check the slug and try again." };
  }

  revalidatePost(data.slug);
  redirect(adminHref("/posts"));
}

export async function deletePost(formData: FormData): Promise<void> {
  if (!(await isAdmin())) return;
  const id = text(formData, "id");
  if (!id) return;

  const post = await prisma.post.findUnique({ where: { id }, select: { slug: true } });
  await prisma.post.delete({ where: { id } });
  revalidatePost(post?.slug);
}

export async function togglePostPublished(formData: FormData): Promise<void> {
  if (!(await isAdmin())) return;
  const id = text(formData, "id");
  if (!id) return;

  const post = await prisma.post.findUnique({ where: { id }, select: { published: true, slug: true } });
  if (!post) return;

  await prisma.post.update({
    where: { id },
    data: post.published ? { published: false } : { published: true, publishedAt: new Date() },
  });
  revalidatePost(post.slug);
}
