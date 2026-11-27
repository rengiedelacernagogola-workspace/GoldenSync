// WHAT: Tests in-memory sliding-window rate limiter used by API routes.
// HOW: `checkRateLimit` allows N then blocks; `resetRateLimitBuckets` between tests.
// SCREEN: Login throttle and upload rate limit error copy.
// EDIT: Limits and windows in `lib/http/rate-limit.ts`.
// KEEP: In-memory only — resets per server instance; not distributed across Vercel lambdas.
// RISK: Medium — prod needs edge/redis limiter for strict global caps.
/**
 * Phase 5 — in-memory rate limit helper.
 * Run: npm run test:unit
 */

import assert from "node:assert/strict";
import { test } from "node:test";

import {
  checkRateLimit,
  resetRateLimitBuckets,
} from "../../lib/http/rate-limit.ts";

test("checkRateLimit allows up to limit then blocks", () => {
  resetRateLimitBuckets();
  const key = "test:rl";
  const now = 1_000_000;
  assert.equal(checkRateLimit(key, 2, 60_000, now).allowed, true);
  assert.equal(checkRateLimit(key, 2, 60_000, now).allowed, true);
  assert.equal(checkRateLimit(key, 2, 60_000, now).allowed, false);
});

test("checkRateLimit resets after window", () => {
  resetRateLimitBuckets();
  const key = "test:rl2";
  assert.equal(checkRateLimit(key, 1, 1000, 0).allowed, true);
  assert.equal(checkRateLimit(key, 1, 1000, 0).allowed, false);
  assert.equal(checkRateLimit(key, 1, 1000, 1001).allowed, true);
});
