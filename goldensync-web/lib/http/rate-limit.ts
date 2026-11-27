/**
 * WHAT: Limits how many API calls one key can make in a time window.
 * HOW: Keeps counters in memory Map; returns allowed / remaining / resetAt.
 * SCREEN: Too many requests → rate-limit error to the user.
 * CHECK: In-memory only — not shared across Vercel instances yet.
 * RISK: High — security and abuse protection; ask a developer before changing.
 *
 * In-memory rate limit helper (Phase 5 scaffold).
 * Replace with shared store (Redis / Upstash) before multi-instance production.
 */

type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

export type RateLimitResult = {
  allowed: boolean;
  remaining: number;
  resetAt: number;
};

/** Sliding fixed-window counter keyed by `${scope}:${id}`. */
export function checkRateLimit(
  key: string,
  limit: number,
  windowMs: number,
  now: number = Date.now(),
): RateLimitResult {
  const current = buckets.get(key);
  if (!current || current.resetAt <= now) {
    const resetAt = now + windowMs;
    buckets.set(key, { count: 1, resetAt });
    return { allowed: true, remaining: limit - 1, resetAt };
  }
  if (current.count >= limit) {
    return { allowed: false, remaining: 0, resetAt: current.resetAt };
  }
  current.count += 1;
  return {
    allowed: true,
    remaining: limit - current.count,
    resetAt: current.resetAt,
  };
}

/** Test helper — clear all buckets. */
export function resetRateLimitBuckets(): void {
  buckets.clear();
}
