import { z } from "zod";

export const MAX_UPLOAD_BYTES = 4 * 1024 * 1024;

export const ALLOWED_UPLOAD_TYPES = ["image/jpeg", "image/png", "image/webp", "application/pdf"] as const;

export const contactSchema = z.object({
  name: z.string().trim().min(2, "Please enter your name").max(80, "Name is too long"),
  email: z.string().trim().min(1, "Please enter your email").email("Enter a valid email address").max(120),
  body: z
    .string()
    .trim()
    .min(10, "Please write at least 10 characters")
    .max(4000, "Message is too long (4000 characters max)"),
  // Honeypot: real users never fill this. Bots do.
  website: z.string().optional().default(""),
});

export type ContactInput = z.infer<typeof contactSchema>;

export const loginSchema = z.object({
  email: z.string().trim().min(1, "Enter your email").max(200),
  password: z.string().min(1, "Enter your password").max(200),
});

export const tagsSchema = z
  .array(z.string().trim().min(1).max(32))
  .max(12, "At most 12 tags")
  .default([]);

export const imageInputSchema = z.object({
  url: z.string().trim().min(1, "Image URL is required").max(2000),
  alt: z.string().trim().min(1, "Alt text is required for every image").max(300),
});

export type ImageInput = z.infer<typeof imageInputSchema>;

export const projectSchema = z.object({
  title: z.string().trim().min(3, "Title must be at least 3 characters").max(120),
  slug: z
    .string()
    .trim()
    .min(1, "Slug is required")
    .max(120)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers and dashes only"),
  summary: z.string().trim().min(10, "Summary must be at least 10 characters").max(280),
  description: z.string().trim().min(1, "Description is required"),
  role: z.string().trim().max(120).optional().default(""),
  tags: tagsSchema,
  githubUrl: z.union([z.string().trim().url("Enter a valid URL"), z.literal("")]).optional().default(""),
  demoUrl: z.union([z.string().trim().url("Enter a valid URL"), z.literal("")]).optional().default(""),
  featured: z.boolean().default(false),
  published: z.boolean().default(false),
  images: z.array(imageInputSchema).max(12, "At most 12 images").default([]),
});

export type ProjectInput = z.infer<typeof projectSchema>;

export const postSchema = z.object({
  title: z.string().trim().min(3, "Title must be at least 3 characters").max(160),
  slug: z
    .string()
    .trim()
    .min(1, "Slug is required")
    .max(160)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers and dashes only"),
  excerpt: z.string().trim().min(10, "Excerpt must be at least 10 characters").max(300),
  body: z.string().trim().min(1, "Body is required"),
  tags: tagsSchema,
  published: z.boolean().default(false),
});

export type PostInput = z.infer<typeof postSchema>;

export const settingsSchema = z.object({
  contactEmail: z.string().trim().email("Enter a valid email address").max(160),
  github: z.string().trim().max(200).optional().default(""),
  linkedin: z.string().trim().max(200).optional().default(""),
  instagram: z.string().trim().max(200).optional().default(""),
});

export function flattenFieldErrors(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.join(".") || "form";
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}
