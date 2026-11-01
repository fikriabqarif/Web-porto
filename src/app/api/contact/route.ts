import { NextResponse } from "next/server";
import { createContactMessage } from "@/lib/contact";
import { getClientIp, rateLimit } from "@/lib/rate-limit";
import { contactSchema } from "@/lib/validation";

export const runtime = "nodejs";

const ONE_HOUR = 60 * 60 * 1000;

export async function POST(request: Request): Promise<NextResponse> {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = contactSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.flatten().fieldErrors },
      { status: 422 },
    );
  }

  // Honeypot: accept silently so bots cannot tell they were filtered.
  if (parsed.data.website.trim().length > 0) return NextResponse.json({ ok: true });

  const ip = getClientIp(request.headers);
  const limit = rateLimit(`contact:${ip}`, 5, ONE_HOUR);
  if (!limit.ok) {
    const retryAfter = Math.max(1, Math.ceil((limit.resetAt - Date.now()) / 1000));
    return NextResponse.json(
      { error: "Too many messages from this address. Try again later." },
      { status: 429, headers: { "Retry-After": String(retryAfter) } },
    );
  }

  const result = await createContactMessage({
    name: parsed.data.name,
    email: parsed.data.email,
    body: parsed.data.body,
  });

  if (!result.ok) return NextResponse.json({ error: result.error }, { status: result.status });
  return NextResponse.json({ ok: true }, { status: 201 });
}
