# SPEC.md — Personal Portfolio Website

> **Note to the AI agent (nanobot):** This spec is written to be executed autonomously.
> Build exactly what is written. Do not ask clarifying questions — make reasonable
> decisions where unspecified, and record every assumption in `README.md` under
> "Assumptions". Any fact marked 【like this】 is a placeholder the owner will fill in
> (or already filled in §1); leave it as-is if still empty.

---

## 1. Site facts (filled by the owner — edit these only)

| Field | Value |
| --- | --- |
| Full name | Fikri Abqari Fawwaz |
| Identity line | Electronics and Instrumentation Student |
| University | Universitas Gadjah Mada, Faculty of Engineering (Department of Electrical Engineering and Information Technology) |
| Location | Yogyakarta, Indonesia |
| Email | fikriabqarifawwaz@gmail.com |
| GitHub | github.com/fikriabqarif |
| LinkedIn | linkedin.com/in/fikriabqarifawwaz |
| CV file | Uploaded later via admin panel (see §9) |

**Seed content:** §11 contains 3 example projects and 2 example notes clearly marked
`EXAMPLE`. If the owner replaced them with real content, use the real content. If not,
build with the examples so every page renders, and list them in README as
"replace before sharing publicly".

---

## 2. One-line goal

A fast, monochrome, Swiss-minimal portfolio site for an Electronics &
Instrumentation student: public pages for projects and notes, and a private
admin panel (email + password login) to add projects, notes, CV, and read
contact messages — deployed on Vercel with a managed Postgres database.

---

## 3. Stack (fixed — no alternatives, do not substitute)

| Layer | Choice |
| --- | --- |
| Framework | Next.js 15 (App Router) + TypeScript, strict mode |
| Styling | Tailwind CSS (no component library — the design is custom minimal) |
| Dark mode | `next-themes` (class strategy, no flash of wrong theme) |
| Database | PostgreSQL hosted on Neon (free tier) — used for dev AND prod |
| ORM | Prisma |
| Auth | Auth.js v5 (`next-auth@beta`), Credentials provider, single admin |
| Password hashing | bcryptjs |
| File uploads | `@vercel/blob` (images + CV PDF), admin-only |
| Markdown | `react-markdown` + `remark-gfm` for project descriptions and note bodies |
| Validation | Zod on every API route and server action |
| Email (optional) | Resend — only if `RESEND_API_KEY` is set; messages are always stored in DB regardless |

Do not add: UI kits (shadcn, MUI), CSS-in-JS, Redux, or any CMS.

---

## 4. Design system — "Monochrome Swiss"

Strict black/white/grey. No colored accents anywhere except form errors.

### Light mode
- Background `#FFFFFF`, foreground `#111111`
- Muted text `#6B7280`, hairline borders `#E5E5E5`

### Dark mode
- Background `#0A0A0A`, foreground `#FAFAFA`
- Muted text `#A1A1AA`, hairline borders `#262626`

### Rules
- Accent = the foreground color itself. Hover states: invert or underline; never color.
- Borders: 1px everywhere. Corners: radius 0 (square). No drop shadows.
- Typography: Inter only. Headings — tight tracking, sentence case, bold.
  Section labels — 11–12px uppercase, letter-spacing 0.1em, muted color.
- Layout: single column, max-width 64rem (max-w-5xl), generous vertical rhythm (space-y-24 on landing sections).
- Motion: subtle only — 150–200ms opacity/underline transitions. No parallax, no bounce.
- Error/danger text may use `#DC2626` (light) / `#F87171` (dark) — the only exception.
- Focus states: 2px solid foreground outline offset 2px (accessibility, keyboard nav).

---

## 5. Database schema (Prisma)

```prisma
model Project {
  id          String         @id @default(cuid())
  slug        String         @unique
  title       String
  summary     String         // 1–2 sentences, shown on cards
  description String         // long markdown, shown on detail page
  role        String?        // e.g. "Hardware lead"
  tags        String[]       // e.g. ["STM32", "PCB", "KiCad"]
  githubUrl   String?
  demoUrl     String?
  featured    Boolean        @default(false)
  published   Boolean        @default(false)
  images      ProjectImage[]
  createdAt   DateTime       @default(now())
  updatedAt   DateTime       @updatedAt
}

model ProjectImage {
  id        String  @id @default(cuid())
  url       String  // Vercel Blob URL or external URL
  alt       String
  sortOrder Int     @default(0)
  project   Project @relation(fields: [projectId], references: [id], onDelete: Cascade)
  projectId String
}

model Post {
  id          String   @id @default(cuid())
  slug        String   @unique
  title       String
  excerpt     String
  body        String   // markdown
  tags        String[]
  published   Boolean  @default(false)
  publishedAt DateTime @default(now())
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model Message {
  id        String   @id @default(cuid())
  name      String
  email     String
  body      String
  read      Boolean  @default(false)
  createdAt DateTime @default(now())
}

model Setting {
  key   String @id          // "cvUrl", "contactEmail", "socials"
  value String
}
```

Notes:
- `socials` setting value = JSON string: `{"github":"…","linkedin":"…","instagram":"…"}`
- cvUrl empty ⇒ hide the "Download CV" button everywhere.

---

## 6. Routes

### Public
| Route | Content |
| --- | --- |
| `/` | Hero (name, identity line, university, one-line tagline, CTAs: View Projects / Download CV) + Featured projects (top 3 by `featured`) + 2 most recent published notes + footer with socials |
| `/about` | Bio, education, interests, skills grouped as Hardware / Software / Tools (from §11 profile data) |
| `/projects` | All published projects as cards (image, title, summary, tags), newest first |
| `/projects/[slug]` | Image gallery, full markdown description, tags, role, GitHub/demo links, prev/next project |
| `/notes` | Published posts list (title, excerpt, date, tags) |
| `/notes/[slug]` | Rendered markdown body, date, tags |
| `/contact` | Form: name, email, message (Zod-validated, honeypot field `website` for spam) |
| `/login` | Admin login form |

### Admin (all under `/admin`, protected)
| Route | Content |
| --- | --- |
| `/admin` | Dashboard: counts of projects / posts / unread messages |
| `/admin/projects` | Table: title, status (draft/published), featured, actions |
| `/admin/projects/new` + `/admin/projects/[id]/edit` | Form: all Project fields, multi-image upload with alt text + ordering, slug auto-generated from title (editable), save as draft or publish |
| `/admin/posts` + `/admin/posts/new` + `/admin/posts/[id]/edit` | Same pattern for notes, body = markdown textarea with live preview pane |
| `/admin/messages` | List contact messages, mark read/unread, delete |
| `/admin/settings` | Upload/replace CV PDF, contact email, social links |

### API
| Route | Behavior |
| --- | --- |
| `POST /api/contact` | Zod-validate, insert Message, optionally send email via Resend if `RESEND_API_KEY` exists. Rate-limit: max 5 per IP per hour. |
| `POST /api/upload` | Admin-only. Single file → Vercel Blob. Accept images (jpeg/png/webp, ≤ 4 MB) and `application/pdf` (≤ 4 MB). Return `{ url }`. |
| `/api/auth/[...nextauth]` | Auth.js handlers |

`middleware.ts`: redirect unauthenticated `/admin/**` requests to `/login?from=…`.

---

## 7. Auth rules

- Exactly one admin: credentials checked against `ADMIN_EMAIL` and
  `ADMIN_PASSWORD_HASH` (bcrypt) from env vars. No sign-up route. No roles.
- Session strategy JWT; session cookie `httpOnly`, `secure` in production,
  30-day expiry.
- All admin server actions and `/api/upload` re-verify the session server-side —
  never trust the client.
- Login page: generic error ("Invalid email or password"), constant-time compare,
  rate-limit 10 attempts per IP per hour.

---

## 8. Content structure for static-ish data

About-page content (bio paragraphs, skills lists, education timeline) lives in
`src/content/profile.ts` as typed constants — not in the database — so it is easy
to edit in one file. Projects, notes, CV, and messages are the DB-driven parts.

---

## 9. Environment variables

```
DATABASE_URL=postgres://…            # Neon connection string
AUTH_SECRET=…                        # `openssl rand -base64 32`
ADMIN_EMAIL=…                        # owner's login email
ADMIN_PASSWORD_HASH=…                # bcrypt hash, generated by `npm run hash-password`
BLOB_READ_WRITE_TOKEN=…              # Vercel Blob (exists automatically on Vercel after enabling)
RESEND_API_KEY=…                     # optional
NEXT_PUBLIC_SITE_URL=https://…       # used for metadata + sitemap
```

Provide `npm run hash-password` (a tiny script printing a bcrypt hash from a
prompt) and document it in the README. Never commit `.env`; include `.env.example`.

---

## 10. Non-functional requirements

- Pages are server-rendered; public project/note pages use `revalidate` on demand
  (revalidate after admin save) — or simply `export const dynamic = 'force-dynamic'`
  if simpler. Correctness first.
- Metadata API on every page: title, description, Open Graph. Generate
  `sitemap.xml` and `robots.txt` (disallow `/admin` and `/login`).
- Responsive from 360px up; nav collapses to a simple menu button under `md`.
- Accessibility: semantic landmarks, labeled form inputs, alt text required for
  every project image, visible focus states, contrast ≥ 4.5:1 for text.
- No client-side secrets. All env access server-side.

---

## 11. Seed data (`prisma/seed.ts`, idempotent)

### Profile content (`src/content/profile.ts`)
- Bio: 2 short paragraphs, first person, 【written by owner or left as marked
  example text】 — mention Electronics and Instrumentation at Universitas Gadjah
  Mada, interests in embedded systems / measurement / instrumentation.
- Skills (example values — owner will edit):
  - Hardware: STM32, ESP32, Arduino, PCB design (KiCad), oscilloscope & DMM usage, soldering
  - Software: Python, C/C++, MATLAB, Git
  - Tools: LabVIEW, LaTeX, Fusion 360 basics

### Example projects (marked EXAMPLE in description's first line)
1. **IoT Weather Station** — ESP32 + BME280, MQTT to a dashboard, solar powered. Tags: ESP32, IoT, MQTT.
2. **Digital Data Logger** — STM32 ADC sampling to SD card, 1 kHz, with a simple Python plotter. Tags: STM32, ADC, Python.
3. **Line-Following Robot** — PID control on ATmega328, custom PCB, competition entry. Tags: Robotics, PID, PCB.

### Example notes
1. "Getting clean ADC readings from a noisy breadboard" (400 words, example)
2. "How I set up my KiCad workspace" (300 words, example)

### Settings
`contactEmail` = email from §1; `cvUrl` empty; `socials` from §1.

---

## 12. Definition of Done — verify every item, in order

1. `npx prisma migrate dev` runs clean; `npm run db:seed` is idempotent (safe to re-run).
2. `npm run build` passes with zero TypeScript errors.
3. All public routes return 200 in dev: `/`, `/about`, `/projects`, `/projects/[seed-slug]`, `/notes`, `/notes/[seed-slug]`, `/contact`.
4. `/admin/**` redirects to `/login` when logged out; wrong password shows generic error; correct env credentials log in.
5. Admin flow works end-to-end: create project with 2 uploaded images → publish → appears on `/projects` and detail page renders markdown + gallery. Same for a note. Upload CV → "Download CV" button appears on home and about pages. Submit `/contact` → message appears in `/admin/messages` with correct rate limiting.
6. Dark/light toggle switches instantly, persists across reloads, no flash on first paint.
7. Keyboard-only navigation reaches every interactive element; forms show inline errors; honeypot silently drops bot submissions.
8. `README.md` written containing: local setup steps, env var table, how to add a project/note via the admin panel, how to change bio/skills in `profile.ts`, Vercel + Neon deploy steps, and an "Assumptions" section listing every decision made beyond this spec.
9. Lighthouse (mobile) on `/`: Performance ≥ 85, Accessibility ≥ 95. Report the numbers in the final summary.

---

## 13. Explicitly out of scope (do not build)

- Comments, analytics dashboards, i18n/EN-ID toggle, newsletters, multi-user
  accounts, rich-text WYSIWYG editors, image CDN transforms.
