"use client";

import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useActionState, useState } from "react";
import { savePost } from "@/actions/posts";
import { idleState } from "@/lib/form-state";
import { adminHref } from "@/lib/admin-path";
import { slugify } from "@/lib/slug";

export type PostFormValues = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  body: string;
  tags: string;
  published: boolean;
};

export function PostForm({ initial }: { initial: PostFormValues }) {
  const [state, formAction, pending] = useActionState(savePost, idleState);
  const [title, setTitle] = useState(initial.title);
  const [slug, setSlug] = useState(initial.slug);
  const [slugTouched, setSlugTouched] = useState(initial.slug.length > 0);
  const [body, setBody] = useState(initial.body);
  const [intent, setIntent] = useState<"draft" | "publish">(initial.published ? "publish" : "draft");
  const [preview, setPreview] = useState(true);

  const errors = state.errors ?? {};

  return (
    <form action={formAction} className="space-y-8">
      <input type="hidden" name="id" value={initial.id} />
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
            onChange={(event) => {
              const value = event.target.value;
              setTitle(value);
              if (!slugTouched) setSlug(slugify(value));
            }}
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
        <label htmlFor="excerpt" className="label block">
          Excerpt
        </label>
        <textarea
          id="excerpt"
          name="excerpt"
          rows={2}
          className="textarea"
          defaultValue={initial.excerpt}
          aria-invalid={Boolean(errors.excerpt)}
        />
        {errors.excerpt ? <p className="field-error">{errors.excerpt}</p> : null}
      </div>

      <div className="space-y-2">
        <label htmlFor="tags" className="label block">
          Tags (comma separated)
        </label>
        <input id="tags" name="tags" className="input" defaultValue={initial.tags} />
        {errors.tags ? <p className="field-error">{errors.tags}</p> : null}
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <label htmlFor="body" className="label block">
            Body (markdown)
          </label>
          <button type="button" className="btn-quiet" onClick={() => setPreview((value) => !value)}>
            {preview ? "Hide preview" : "Show preview"}
          </button>
        </div>

        <div className={preview ? "grid gap-4 lg:grid-cols-2" : "grid gap-4"}>
          <textarea
            id="body"
            name="body"
            rows={20}
            className="textarea font-mono text-xs"
            value={body}
            onChange={(event) => setBody(event.target.value)}
            aria-invalid={Boolean(errors.body)}
          />
          {preview ? (
            <div className="max-h-[32rem] overflow-y-auto border border-border p-4" aria-live="polite">
              <p className="label mb-3">Preview</p>
              <div className="prose prose-sm">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{body}</ReactMarkdown>
              </div>
            </div>
          ) : null}
        </div>
        {errors.body ? <p className="field-error">{errors.body}</p> : null}
      </div>

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
        <Link href={adminHref("/posts")} className="label link-underline">
          Cancel
        </Link>
      </div>
    </form>
  );
}
