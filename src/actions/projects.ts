"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { adminHref } from "@/lib/admin-path";
import { isAdmin } from "@/lib/auth-guard";
import type { FormState } from "@/lib/form-state";
import { prisma } from "@/lib/prisma";
import { flattenFieldErrors, projectSchema, type ImageInput } from "@/lib/validation";

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

function parseImages(formData: FormData): unknown {
  const raw = text(formData, "images") || "[]";
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function revalidateProject(slug?: string): void {
  revalidatePath("/");
  revalidatePath("/projects");
  if (slug) revalidatePath(`/projects/${slug}`);
  revalidatePath("/admin/projects");
  revalidatePath("/admin");
}

export async function saveProject(_previous: FormState, formData: FormData): Promise<FormState> {
  if (!(await isAdmin())) return { status: "error", message: "Your session has expired. Please log in again." };

  const images = parseImages(formData);
  if (images === null) return { status: "error", message: "Image data was malformed. Please reload and try again." };

  const parsed = projectSchema.safeParse({
    title: text(formData, "title"),
    slug: text(formData, "slug"),
    summary: text(formData, "summary"),
    description: text(formData, "description"),
    role: text(formData, "role"),
    tags: parseTags(formData),
    githubUrl: text(formData, "githubUrl"),
    demoUrl: text(formData, "demoUrl"),
    featured: formData.get("featured") === "on" || formData.get("featured") === "true",
    published: formData.getAll("intent").map(String).includes("publish"),
    images,
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
  const imageRows = data.images.map((image: ImageInput, index: number) => ({
    url: image.url,
    alt: image.alt,
    sortOrder: index,
  }));

  const clash = await prisma.project.findUnique({ where: { slug: data.slug }, select: { id: true } });
  if (clash && clash.id !== id) {
    return { status: "error", message: "Please fix the highlighted fields.", errors: { slug: "That slug is already taken." } };
  }

  const fields = {
    slug: data.slug,
    title: data.title,
    summary: data.summary,
    description: data.description,
    role: data.role ? data.role : null,
    tags: data.tags,
    githubUrl: data.githubUrl ? data.githubUrl : null,
    demoUrl: data.demoUrl ? data.demoUrl : null,
    featured: data.featured,
    published: data.published,
  };

  try {
    if (id) {
      await prisma.project.update({
        where: { id },
        data: { ...fields, images: { deleteMany: {}, create: imageRows } },
      });
    } else {
      await prisma.project.create({ data: { ...fields, images: { create: imageRows } } });
    }
  } catch {
    return { status: "error", message: "Could not save the project. Check the slug and try again." };
  }

  revalidateProject(data.slug);
  redirect(adminHref("/projects"));
}

export async function deleteProject(formData: FormData): Promise<void> {
  if (!(await isAdmin())) return;
  const id = text(formData, "id");
  if (!id) return;

  const project = await prisma.project.findUnique({ where: { id }, select: { slug: true } });
  await prisma.project.delete({ where: { id } });
  revalidateProject(project?.slug);
}

export async function toggleProjectPublished(formData: FormData): Promise<void> {
  if (!(await isAdmin())) return;
  const id = text(formData, "id");
  if (!id) return;

  const project = await prisma.project.findUnique({ where: { id }, select: { published: true, slug: true } });
  if (!project) return;

  await prisma.project.update({ where: { id }, data: { published: !project.published } });
  revalidateProject(project.slug);
}

export async function toggleProjectFeatured(formData: FormData): Promise<void> {
  if (!(await isAdmin())) return;
  const id = text(formData, "id");
  if (!id) return;

  const project = await prisma.project.findUnique({ where: { id }, select: { featured: true, slug: true } });
  if (!project) return;

  await prisma.project.update({ where: { id }, data: { featured: !project.featured } });
  revalidateProject(project.slug);
}
