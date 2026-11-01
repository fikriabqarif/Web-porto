type Bucket = { count: number; resetAt: number };

const globalForLimit = globalThis as unknown as { __rateBuckets?: Map<string, Bucket> };
const buckets = (globalForLimit.__rateBuckets ??= new Map<string, Bucket>());

export type RateLimitResult = { ok: boolean; remaining: number; resetAt: number };

/**
 * Fixed-window rate limiter held in process memory.
 * Good enough for a single-instance deployment; on serverless/Vercel the count
 * resets whenever a new lambda instance boots (documented in README).
 */
export function rateLimit(key: string, limit: number, windowMs: number): RateLimitResult {
  const now = Date.now();
  const existing = buckets.get(key);

  if (!existing || existing.resetAt <= now) {
    const resetAt = now + windowMs;
    buckets.set(key, { count: 1, resetAt });
    return { ok: true, remaining: limit - 1, resetAt };
  }

  if (existing.count >= limit) {
    return { ok: false, remaining: 0, resetAt: existing.resetAt };
  }

  existing.count += 1;
  return { ok: true, remaining: limit - existing.count, resetAt: existing.resetAt };
}

export function getClientIp(headers: Headers): string {
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  return headers.get("x-real-ip") ?? "unknown";
}
