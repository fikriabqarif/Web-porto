import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { put } from "@vercel/blob";
import { ALLOWED_UPLOAD_TYPES, MAX_UPLOAD_BYTES } from "@/lib/validation";

const EXT_BY_TYPE: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "application/pdf": "pdf",
};

export class UploadError extends Error {
  constructor(
    message: string,
    readonly status = 400,
  ) {
    super(message);
    this.name = "UploadError";
  }
}

/**
 * Stores an uploaded file.
 * With BLOB_READ_WRITE_TOKEN set (production) it goes to Vercel Blob.
 * Without it (local development) it is written to /public/uploads so the whole
 * admin flow stays testable offline.
 */
export async function storeFile(file: File, prefix = "uploads"): Promise<string> {
  if (!ALLOWED_UPLOAD_TYPES.includes(file.type as (typeof ALLOWED_UPLOAD_TYPES)[number])) {
    throw new UploadError("Unsupported file type. Use JPEG, PNG, WebP or PDF.");
  }
  if (file.size === 0) throw new UploadError("The file is empty.");
  if (file.size > MAX_UPLOAD_BYTES) throw new UploadError("Files must be 4 MB or smaller.", 413);

  const ext = EXT_BY_TYPE[file.type] ?? "bin";
  const filename = `${Date.now()}-${randomUUID().slice(0, 8)}.${ext}`;
  const key = `${prefix}/${filename}`;
  const token = process.env.BLOB_READ_WRITE_TOKEN;

  if (token) {
    const blob = await put(key, file, {
      access: "public",
      contentType: file.type,
      addRandomSuffix: false,
      token,
    });
    return blob.url;
  }

  const destination = path.join(process.cwd(), "public", prefix, filename);
  await mkdir(path.dirname(destination), { recursive: true });
  await writeFile(destination, Buffer.from(await file.arrayBuffer()));
  return `/${key}`;
}
