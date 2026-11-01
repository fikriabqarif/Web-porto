# web_porto

Personal portfolio for Fikri Abqari Fawwaz — monochrome Swiss layout, server-rendered
Next.js App Router, a small Postgres-backed admin panel for projects, notes, messages
and site settings, and a single-password login.

- Public pages: `/`, `/about`, `/projects`, `/projects/[slug]`, `/notes`, `/notes/[slug]`, `/contact`
- Admin: `/admin`, `/admin/projects`, `/admin/posts`, `/admin/messages`, `/admin/settings`
- API: `POST /api/contact`, `POST /api/upload`, `/api/auth/[...nextauth]`
- Generated: `/sitemap.xml`, `/robots.txt` (both disallow `/admin` and `/login`)

---

## 1. Local setup

Requirements: Node 20+, a reachable PostgreSQL 16 database, npm.

```bash
git clone <repo> web_porto && cd web_porto
npm install                      # also runs `prisma generate` via postinstall
cp .env.example .env             # then fill in the values (see §2)
npx prisma migrate dev           # create the schema
npm run db:seed                  # EXAMPLE projects/notes + settings (idempotent)
npm run dev                      # http://localhost:3000
```

First admin password:

```bash
npm run hash-password            # prompts for a password, prints a bcrypt hash
# or pass it inline: npm run hash-password -- 'my-password'
```

Paste the printed hash into `ADMIN_PASSWORD_HASH` in `.env`. The email you put in
`ADMIN_EMAIL` is the login identity — there is no user table, the account lives
entirely in environment variables, so rotating the password means re-running the
script and restarting the server.

Escaping differs by target: a local `.env` file needs every `$` written as `\$`
(Next's loader would otherwise expand `$2b` and mangle the hash), while a hosting
dashboard such as Vercel stores the value literally and needs the **raw** hash
with plain `$`. A `\$` hash in Vercel is not a valid bcrypt salt, so every login
fails with "Invalid email or password" and the server logs a
`[auth] ADMIN_PASSWORD_HASH is not a bcrypt hash` line.

Production-style run:

```bash
npm run build && npm run start
```

Useful scripts: `npm run typecheck`, `npm run db:migrate`, `npm run db:seed`,
`npm run hash-password`, `npm run verify`.

`npm run verify` is a headless self-check of the parts that do not need a browser: it
writes two images and a PDF through the same `storeFile` path as `/api/upload`, inserts
and removes a contact message, exercises the rate limiter, creates and deletes a project
with a two-image gallery, and renders markdown. It cleans up after itself and is safe to
run against a development database.

Local database used during development (any Postgres works):

```bash
sudo apt install postgresql
sudo -u postgres psql -c "CREATE ROLE webporto LOGIN PASSWORD 'webporto_dev';"
sudo -u postgres psql -c "CREATE DATABASE webporto OWNER webporto;"
```

> Without `BLOB_READ_WRITE_TOKEN`, uploads are written to `public/uploads/`
> (gitignored) instead of Vercel Blob — see Assumptions.

---

## 2. Environment variables

| Variable | Required | Purpose |
| --- | --- | --- |
| `DATABASE_URL` | yes | Postgres connection string. On Neon use the **pooled** string (hostname contains `-pooler`) — that is what the app talks to. |
| `DATABASE_URL_UNPOOLED` | Neon only | **Direct** (unpooled) Neon string, used only by the Prisma CLI for `migrate`/`db push`/introspect via `directUrl` in `schema.prisma`. Point it at the same local URL when working against local Postgres. |
| `AUTH_SECRET` | yes | Auth.js signing secret. Generate with `openssl rand -base64 32`. |
| `ADMIN_EMAIL` | yes | The single admin login email. |
| `ADMIN_PASSWORD_HASH` | yes | bcrypt hash of the admin password from `npm run hash-password`. Raw `$` form for hosting dashboards; `\$`-escaped only in a local `.env`. |
| `BLOB_READ_WRITE_TOKEN` | prod only | Vercel Blob token for image/CV uploads. Without it uploads fall back to `public/uploads/`. |
| `RESEND_API_KEY` | optional | If set, contact messages are also emailed to `contactEmail`. Without it they are only stored in the admin inbox. |
| `NEXT_PUBLIC_SITE_URL` | yes | Absolute site URL used for metadata, Open Graph and `sitemap.xml`. |
| `NEXT_IMAGE_UNOPTIMIZED` | optional | Set to `1` on hosts where libvips/sharp crashes (old x86 CPUs without SSE4.2). Skips `/_next/image` and serves the original files. Leave unset on Vercel. |

`.env` is gitignored; `.env.example` documents every key. No secret is ever read on
the client — only `NEXT_PUBLIC_SITE_URL` is exposed to the browser.

---

## 3. Adding a project (admin panel)

1. Go to `/login`, sign in with `ADMIN_EMAIL` + the password you hashed.
2. `Admin → Projects → New project`.
3. Fill in title (the slug auto-fills, edit it if you want), summary, markdown
   description, optional role, comma-separated tags, GitHub/demo URLs.
4. Upload images with the file picker. Each upload creates one gallery entry; give
   every image **alt text** (required — the form will refuse to save without it) and
   reorder with the up/down buttons. `Featured` marks it for the home page.
5. `Save as draft` keeps it out of the public site; `Publish` makes it live and
   revalidates `/`, `/projects` and the detail page.

Deleting a project removes its image rows too (Prisma cascade); the files themselves
stay in Blob storage.

## 4. Adding a note (admin panel)

`Admin → Notes → New note`. Title, slug, excerpt, tags and a markdown body; the editor
shows a live preview using the same `react-markdown` + `remark-gfm` pipeline the
public page uses. `Save as draft` / `Publish` behave like projects. Publishing for the
first time stamps `publishedAt`; unpublishing keeps the original date.

## 5. Editing bio, skills and static copy

Everything on `/` and `/about` that is not in the database lives in
`src/content/profile.ts`:

- `site` — name, identity line, university, location, email, social URLs, tagline
- `bio` — two first-person paragraphs (currently marked example text — replace it)
- `education`, `interests`, `skills` — arrays rendered as lists and grouped tag rows

The CV link is not in `profile.ts`: upload the PDF once under `Admin → Settings → CV`
and the download button appears on `/` and `/about` automatically. Contact email and
social links are also editable there (stored in the `Setting` table, falling back to
`profile.ts` values).

---

## 6. Deploy: Vercel + Neon

1. **Neon** — create a project and a database, copy the pooled connection string
   (`postgresql://…?sslmode=require`).
2. **Vercel** — import the repo; the App Router preset needs no changes.
3. Environment variables: add all of §2. Set `NEXT_PUBLIC_SITE_URL` to the production
   domain (e.g. `https://fikri.example`) so sitemap/OG tags are absolute.
4. **Blob** — in the Vercel project open *Storage → Blob*, create a store, and connect
   it; `BLOB_READ_WRITE_TOKEN` is then injected automatically.
5. **Migrations** — run once from your machine against the Neon URL:
   `DATABASE_URL='postgres://…neon…' npx prisma migrate deploy`
   Optionally `DATABASE_URL='…' npm run db:seed` for the example content.
6. Deploy. Then visit `/login` and change the password by updating
   `ADMIN_PASSWORD_HASH` and redeploying.

Uploaded files live in Blob storage, images are served through `next/image` with an
allow-list of any `https://` host, and every public page is dynamic — new content shows
up immediately after saving, no redeploy needed.

---

## 7. Assumptions

Decisions taken beyond the spec, and why:

1. **Upload storage falls back to disk.** `/api/upload` uses `@vercel/blob` when
   `BLOB_READ_WRITE_TOKEN` is present; otherwise it writes to `public/uploads/` and
   returns `/uploads/<name>`, so the whole admin flow (2 images, CV) is testable
   locally and on a self-hosted box without a Vercel account. `public/uploads` is
   gitignored.
2. **`next/image` remote allow-list is `https://**`** so images from Blob (random
   subdomains) and any external host work. `localhost` over plain HTTP is allowed for
   dev. `dangerouslyAllowSVG` is not enabled.
3. **Rate limiting is in-process memory** (fixed window, 5 contact submissions per IP
   per hour). On Vercel each lambda instance has its own counter, so the limit is
   per-instance rather than global; a Redis/KV store was explicitly not added.
4. **Honeypot instead of a captcha.** A hidden `website` field is validated by Zod but
   any non-empty value makes the action return the success message while silently
   dropping the submission. No third-party script, nothing to solve for real users.
5. **Notes/projects are dynamic, not ISR.** Pages use `export const dynamic =
   "force-dynamic"` plus `revalidatePath` after each save — the spec allowed either,
   and the simpler option avoids stale content on a low-traffic site.
6. **Drafts are invisible everywhere.** `published = false` rows are excluded from
   lists, detail pages (404), `/sitemap.xml` and the home page; only the admin sees
   them.
7. **Auth is env-only Credentials.** One account, `ADMIN_EMAIL` + bcrypt hash compared
   with `bcryptjs.compare`; a wrong email and a wrong password return the same generic
   message. Sessions are JWT (no adapter tables). `middleware.ts` guards every
   `/admin/**` path and remembers the origin as `/login?from=…`.
8. **No ESLint.** The spec fixes TypeScript strict as the quality gate; adding an
   ESLint config and Next's lint step would have meant another dependency tree for no
   behavioural gain. `npm run typecheck` is the check that runs.
9. **Markdown is rendered without raw HTML.** `react-markdown` + `remark-gfm` are used
   with default sanitisation, so `rehype-raw` is not installed — HTML in a note body is
   escaped rather than rendered.
10. **Seed data is upsert-based.** Projects and notes key on `slug` (re-running the seed
    refreshes the example rows and re-publishes them), settings key on `key` and are
    only inserted when missing, so admin edits to contact/socials/CV survive a re-seed.
11. **`/api/upload` requires a session** and rejects anything that is not JPEG, PNG,
    WebP or PDF, or is larger than 4 MB (413). Filenames are
    `<timestamp>-<random>.<ext>` so uploads never collide.
12. **CV is a single setting, not a file list.** `Setting.cvUrl` holds one URL; removing
    it blanks the key and the download button disappears from `/` and `/about`.
13. **Resend is optional.** When `RESEND_API_KEY` is absent the contact action still
    stores the message (admin inbox is the source of truth) and simply skips the email
    copy, so the form never fails because of a missing mail provider.
14. **Local dev credentials are throwaway.** The repository ships no real secrets;
    `.env.example` carries placeholders and the admin hash must be regenerated.
