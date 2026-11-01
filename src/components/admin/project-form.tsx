"use client";

import Link from "next/link";
import { useActionState, useRef, useState } from "react";
import { saveProject } from "@/actions/projects";
import { idleState } from "@/lib/form-state";
import { adminHref } from "@/lib/admin-path";
import { slugify } from "@/lib/slug";

export type ProjectFormValues = {
  id: string;
  title: string;
  slug: string;
  summary: string;
  description: string;
  role: string;
  tags: string;
  githubUrl: string;
  demoUrl: string;
  featured: boolean;
  published: boolean;
  images: { url: string; alt: string }[];
};

type ImageEntry = { url: string; alt: string };

export function ProjectForm({ initial }: { initial: ProjectFormValues }) {
  const [state, formAction, pending] = useActionState(saveProject, idleState);
  const [title, setTitle] = useState(initial.title);
  const [slug, setSlug] = useState(initial.slug);
  const [slugTouched, setSlugTouched] = useState(initial.slug.length > 0);
  const [images, setImages] = useState<ImageEntry[]>(initial.images);
  const [intent, setIntent] = useState<"draft" | "publish">(initial.published ? "publish" : "draft");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  const errors = state.errors ?? {};

  function onTitleChange(value: string) {
    setTitle(value);
    if (!slugTouched) setSlug(slugify(value));
  }

  async function uploadFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setUploading(true);
    setUploadError(null);

    try {
      for (const file of Array.from(files)) {
        const body = new FormData();
        body.append("file", file);
        body.append("prefix", "projects");
        const response = await fetch("/api/upload", { method: "POST", body });
        const data = (await response.json().catch(() => ({}))) as { url?: string; error?: string };
        if (!response.ok || !data.url) throw new Error(data.error ?? "Upload failed");
        setImages((previous) => [...previous, { url: data.url as string, alt: "" }]);
      }
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : "Upload failed");
    } finally {
      setUploading(false);
      if (fileInput.current) fileInput.current.value = "";
    }
  }

  function moveImage(index: number, direction: -1 | 1) {
    setImages((previous) => {
      const next = [...previous];
      const target = index + direction;
      if (target < 0 || target >= next.length) return previous;
      const current = next[index];
      const other = next[target];
      if (!current || !other) return previous;
      next[index] = other;
      next[target] = current;
      return next;
    });
  }

  return (
    <form action={formAction} className="space-y-10">
      <input type="hidden" name="id" value={initial.id} />
      <input type="hidden" name="images" value={JSON.stringify(images)} />
      <input type="hidden" name="intent" value={intent} />

      {state.status === "error" && state.message ? (
        <p role="alert" className="field-error border border-danger p-3">
          {state.message}
        </p>
      ) : null}

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor="title" className="label block">
            Title
          </label>
          <input
            id="title"
            name="title"
            className="input"
            value={title}
            onChange={(event) => onTitleChange(event.target.value)}
            aria-invalid={Boolean(errors.title)}
          />
          {errors.title ? <p className="field-error">{errors.title}</p> : null}
        </div>

        <div className="space-y-2">
          <label htmlFor="slug" className="label block">
            Slug
          </label>
          <input
            id="slug"
            name="slug"
            className="input"
            value={slug}
            onChange={(event) => {
              setSlugTouched(true);
              setSlug(event.target.value);
            }}
            aria-invalid={Boolean(errors.slug)}
          />
          {errors.slug ? <p className="field-error">{errors.slug}</p> : null}
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="summary" className="label block">
          Summary (1-2 sentences, shown on cards)
        </label>
        <textarea
          id="summary"
          name="summary"
          rows={2}
          className="textarea"
          defaultValue={initial.summary}
          aria-invalid={Boolean(errors.summary)}
        />
        {errors.summary ? <p className="field-error">{errors.summary}</p> : null}
      </div>

      <div className="space-y-2">
        <label htmlFor="description" className="label block">
          Description (markdown)
        </label>
        <textarea
          id="description"
          name="description"
          rows={14}
          className="textarea font-mono text-xs"
          defaultValue={initial.description}
          aria-invalid={Boolean(errors.description)}
        />
        {errors.description ? <p className="field-error">{errors.description}</p> : null}
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor="role" className="label block">
            Role
          </label>
          <input id="role" name="role" className="input" defaultValue={initial.role} />
          {errors.role ? <p className="field-error">{errors.role}</p> : null}
        </div>

        <div className="space-y-2">
          <label htmlFor="tags" className="label block">
            Tags (comma separated)
          </label>
          <input id="tags" name="tags" className="input" defaultValue={initial.tags} />
          {errors.tags ? <p className="field-error">{errors.tags}</p> : null}
        </div>

        <div className="space-y-2">
          <label htmlFor="githubUrl" className="label block">
            GitHub URL
          </label>
          <input id="githubUrl" name="githubUrl" className="input" defaultValue={initial.githubUrl} />
          {errors.githubUrl ? <p className="field-error">{errors.githubUrl}</p> : null}
        </div>

        <div className="space-y-2">
          <label htmlFor="demoUrl" className="label block">
            Demo URL
          </label>
          <input id="demoUrl" name="demoUrl" className="input" defaultValue={initial.demoUrl} />
          {errors.demoUrl ? <p className="field-error">{errors.demoUrl}</p> : null}
        </div>
      </div>

      <fieldset className="space-y-3 border border-border p-4">
        <legend className="label px-2">Flags</legend>
        <label className="flex items-center gap-3 text-sm">
          <input type="checkbox" name="featured" defaultChecked={initial.featured} className="h-4 w-4" />
          Featured on the home page
        </label>
      </fieldset>

      <section className="space-y-4" aria-labelledby="images-heading">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 id="images-heading" className="label">
            Images ({images.length})
          </h2>
          <div className="flex items-center gap-3">
            <label htmlFor="image-upload" className="btn-quiet cursor-pointer">
              {uploading ? "Uploading…" : "Upload images"}
            </label>
            <input
              id="image-upload"
              ref={fileInput}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              className="sr-only"
              onChange={(event) => void uploadFiles(event.target.files)}
            />
          </div>
        </div>

        {uploadError ? (
          <p role="alert" className="field-error">
            {uploadError}
          </p>
        ) : null}
        {errors.images ? <p className="field-error">{errors.images}</p> : null}
        {errors["images.0.alt"] ? <p className="field-error">{errors["images.0.alt"]}</p> : null}

        {images.length === 0 ? (
          <p className="text-sm text-muted">No images yet. Upload one or paste a URL below.</p>
        ) : (
          <ul className="space-y-4">
            {images.map((image, index) => (
              <li key={`${image.url}-${index}`} className="grid gap-3 border border-border p-3 sm:grid-cols-[8rem_1fr_auto]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={image.url} alt="" className="h-20 w-full border border-border object-cover" />
                <div className="space-y-1">
                  <label htmlFor={`alt-${index}`} className="label block">
                    Alt text (required)
                  </label>
                  <input
                    id={`alt-${index}`}
                    className="input"
                    value={image.alt}
                    onChange={(event) =>
                      setImages((previous) =>
                        previous.map((item, itemIndex) =>
                          itemIndex === index ? { ...item, alt: event.target.value } : item,
                        ),
                      )
                    }
                    aria-invalid={image.alt.trim().length === 0}
                  />
                </div>
                <div className="flex items-start gap-2">
                  <button type="button" className="btn-quiet" onClick={() => moveImage(index, -1)} aria-label="Move image up">
                    ↑
                  </button>
                  <button type="button" className="btn-quiet" onClick={() => moveImage(index, 1)} aria-label="Move image down">
                    ↓
                  </button>
                  <button
                    type="button"
                    className="btn-quiet"
                    aria-label="Remove image"
                    onClick={() => setImages((previous) => previous.filter((_, itemIndex) => itemIndex !== index))}
                  >
                    ✕
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}

        <div className="flex flex-wrap items-end gap-3 border-t border-border pt-4">
          <div className="min-w-[16rem] flex-1 space-y-1">
            <label htmlFor="image-url" className="label block">
              Add image by URL
            </label>
            <input id="image-url" className="input" placeholder="https://…" />
          </div>
          <button
            type="button"
            className="btn-secondary"
            onClick={() => {
              const input = document.getElementById("image-url") as HTMLInputElement | null;
              const value = input?.value.trim() ?? "";
              if (!value) return;
              setImages((previous) => [...previous, { url: value, alt: "" }]);
              if (input) input.value = "";
            }}
          >
            Add URL
          </button>
        </div>
      </section>

      <div className="flex flex-wrap items-center gap-3 border-t border-border pt-6">
        <button
          type="submit"
          name="intent"
          value="draft"
          className="btn-secondary"
          onPointerDown={() => setIntent("draft")}
          disabled={pending}
        >
          Save as draft
        </button>
        <button
          type="submit"
          name="intent"
          value="publish"
          className="btn-primary"
          onPointerDown={() => setIntent("publish")}
          disabled={pending}
        >
          Publish
        </button>
        <Link href={adminHref("/projects")} className="label link-underline">
          Cancel
        </Link>
      </div>
    </form>
  );
}
