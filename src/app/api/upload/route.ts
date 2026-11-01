import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth-guard";
import { storeFile, UploadError } from "@/lib/upload";

export const runtime = "nodejs";

export async function POST(request: Request): Promise<NextResponse> {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Expected multipart form data" }, { status: 400 });
  }

  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  const rawPrefix = formData.get("prefix");
  const prefix = typeof rawPrefix === "string" && /^[a-z0-9-]{1,24}$/.test(rawPrefix) ? rawPrefix : "uploads";

  try {
    const url = await storeFile(file, prefix);
    return NextResponse.json({ url });
  } catch (error) {
    if (error instanceof UploadError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
