import "server-only";

/**
 * WHAT: Requires a unique Idempotency-Key header on create API calls.
 * HOW: Reads the header; rejects missing or too-short/too-long keys.
 * SCREEN: Nothing alone — prevents double-create if the browser retries.
 * CHECK: Persistence/replay table may still be incomplete (Phase 1).
 * RISK: High — skipping this can create duplicate subjects/notes.
 *
 * Idempotency-Key gate for create routes (architecture §5.4).
 * Phase 1: require + validate key shape. Persist/replay lands with IdempotencyKey table.
 */

import { validationFailed } from "@/lib/http/errors";

/** Read and validate Idempotency-Key (required on create POSTs). */
export function requireIdempotencyKey(request: Request): string {
  const key = request.headers.get("idempotency-key")?.trim();
  if (!key) {
    throw validationFailed("Idempotency-Key header is required.");
  }
  if (key.length < 8 || key.length > 128) {
    throw validationFailed("Idempotency-Key must be 8–128 characters.");
  }
  return key;
}
