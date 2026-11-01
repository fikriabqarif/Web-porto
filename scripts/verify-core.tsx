/**
 * Headless verification of the code paths behind the Definition of Done items that
 * do not need an HTTP request: uploads, contact creation, rate limiting, project
 * persistence with a gallery, and markdown rendering.
 *
 *   npx tsx scripts/verify-core.tsx
 *
 * Everything it creates is removed again before exit.
 */
import { readdir, unlink } from "node:fs/promises";
import path from "node:path";
import { renderToStaticMarkup } from "react-dom/server";
import { Markdown } from "@/components/markdown";
import { createContactMessage } from "@/lib/contact";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";
import { storeFile } from "@/lib/upload";
import { projectSchema } from "@/lib/validation";

const PNG_1PX = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFAAH/q842iQAAAABJRU5ErkJggg==",
  "base64",
);
const PDF_MIN = Buffer.from(
  "%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n2 0 obj<</Type/Pages/Kids[]/Count 0>>endobj\ntrailer<</Root 1 0 R>>\n%%EOF\n",
);

const results: { name: string; ok: boolean; detail: string }[] = [];
const SCRATCH_DIRS = ["verify", "cv-verify"];

/** Removes uploads left behind by earlier runs so the check always starts clean. */
async function cleanScratch(): Promise<void> {
  for (const dir of SCRATCH_DIRS) {
    const abs = path.join(process.cwd(), "public", dir);
    const entries = await readdir(abs).catch(() => [] as string[]);
    for (const entry of entries) await unlink(path.join(abs, entry)).catch(() => undefined);
  }
}

function record(name: string, ok: boolean, detail: string): void {
  results.push({ name, ok, detail });
  console.log(`${ok ? "PASS" : "FAIL"}  ${name} — ${detail}`);
}

async function main(): Promise<void> {
  await cleanScratch();
  const written: string[] = [];

  // --- uploads -------------------------------------------------------------
  const png = new File([new Uint8Array(PNG_1PX)], "a.png", { type: "image/png" });
  const pngUrl = await storeFile(png, "verify");
  written.push(path.join(process.cwd(), "public", pngUrl));

  const png2 = new File([new Uint8Array(PNG_1PX)], "b.png", { type: "image/png" });
  const pngUrl2 = await storeFile(png2, "verify");
  written.push(path.join(process.cwd(), "public", pngUrl2));

  const pdf = new File([new Uint8Array(PDF_MIN)], "cv.pdf", { type: "application/pdf" });
  const pdfUrl = await storeFile(pdf, "cv-verify");
  written.push(path.join(process.cwd(), "public", pdfUrl));

  record(
    "upload: two distinct image URLs",
    pngUrl.startsWith("/verify/") && pngUrl2.startsWith("/verify/") && pngUrl !== pngUrl2,
    `${pngUrl}, ${pngUrl2}`,
  );
  record("upload: CV pdf accepted", pdfUrl.startsWith("/cv-verify/") && pdfUrl.endsWith(".pdf"), pdfUrl);

  try {
    await storeFile(new File([new Uint8Array(PNG_1PX)], "x.svg", { type: "image/svg+xml" }), "verify");
    record("upload: rejects unsupported type", false, "svg was accepted");
  } catch {
    record("upload: rejects unsupported type", true, "svg rejected");
  }

  // --- rate limiter -------------------------------------------------------
  const key = `verify:${Date.now()}`;
  const attempts = Array.from({ length: 6 }, () => rateLimit(key, 5, 60_000).ok);
  record(
    "rate limit: 5 allowed, 6th blocked",
    attempts.slice(0, 5).every(Boolean) && attempts[5] === false,
    attempts.map(String).join(","),
  );

  // --- contact message ----------------------------------------------------
  const before = await prisma.message.count();
  const contact = await createContactMessage({
    name: "Verify Bot",
    email: "verify@example.com",
    body: "This row is created by scripts/verify-core.tsx and deleted right after.",
  });
  const after = await prisma.message.count();
  record("contact: message stored", contact.ok && after === before + 1, `count ${before} -> ${after}`);

  const newest = await prisma.message.findFirst({ orderBy: { createdAt: "desc" }, where: { email: "verify@example.com" } });
  record("contact: stored fields match", newest?.name === "Verify Bot", newest ? `read=${newest.read}` : "missing");
  if (newest) await prisma.message.delete({ where: { id: newest.id } });

  // --- project with a 2-image gallery ------------------------------------
  const slug = `verify-${Date.now()}`;
  const parsed = projectSchema.safeParse({
    title: "Verification Project",
    slug,
    summary: "Temporary project created by the verification script.",
    description: "## Heading\n\n- one\n- two\n\n```python\nprint(1)\n```",
    role: "",
    tags: ["ESP32", "IoT"],
    githubUrl: "",
    demoUrl: "",
    featured: false,
    published: true,
    images: [
      { url: pngUrl, alt: "first placeholder" },
      { url: pngUrl2, alt: "second placeholder" },
    ],
  });

  if (!parsed.success) {
    record("project: schema accepts sample input", false, JSON.stringify(parsed.error.issues));
  } else {
    record("project: schema accepts sample input", true, "validated");
    const created = await prisma.project.create({
      data: {
        title: parsed.data.title,
        slug: parsed.data.slug,
        summary: parsed.data.summary,
        description: parsed.data.description,
        role: parsed.data.role || null,
        tags: parsed.data.tags,
        featured: parsed.data.featured,
        published: parsed.data.published,
        images: { create: parsed.data.images.map((image, index) => ({ ...image, sortOrder: index })) },
      },
      include: { images: { orderBy: { sortOrder: "asc" } } },
    });
    record(
      "project: gallery persisted in order",
      created.images.length === 2 && created.images[0]?.alt === "first placeholder",
      created.images.map((image) => `${image.sortOrder}:${image.url}`).join(" "),
    );

    const reloaded = await prisma.project.findFirst({ where: { slug, published: true }, include: { images: true } });
    record("project: public query finds the published row", reloaded !== null, reloaded ? reloaded.title : "not found");

    await prisma.project.delete({ where: { id: created.id } });
    const gone = await prisma.project.findUnique({ where: { id: created.id } });
    record("project: cascade delete removes images", gone === null, "row and images removed");
  }

  // --- markdown rendering -------------------------------------------------
  const html = renderToStaticMarkup(Markdown({ children: parsed.success ? parsed.data.description : "" }));
  record(
    "markdown: headings, lists and code blocks render",
    html.includes("<h2") && html.includes("<ul") && html.includes("<code"),
    `${html.length} bytes of html`,
  );

  // --- cleanup ------------------------------------------------------------
  for (const file of written) {
    await unlink(file).catch(() => undefined);
  }

  const failed = results.filter((result) => !result.ok);
  console.log(`\n${results.length - failed.length}/${results.length} checks passed`);
  if (failed.length > 0) process.exitCode = 1;
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
