// WHAT: Tests blob pathname rules — user id must own `ingest/{userId}/...` paths.
// HOW: `isValidIngestPathname` true/false cases for pdf paths and traversal attempts.
// SCREEN: Add Subject PDF upload to Vercel Blob before parse.
// EDIT: When storage layout changes in `lib/domain/ingest-path.ts`.
// KEEP: Reject `..` and wrong user prefix — prevents cross-user file access.
// RISK: Medium — weak validation would allow reading another user’s uploads.
/**
 * Phase 4 — ingest pathname policy.
 * Run: npm run test:unit
 */

import assert from "node:assert/strict";
import { test } from "node:test";

import { isValidIngestPathname } from "../../lib/domain/ingest-path.ts";

test("isValidIngestPathname accepts user-scoped pdf", () => {
  assert.equal(
    isValidIngestPathname("ingest/user_1/abc.pdf", "user_1"),
    true,
  );
});

test("isValidIngestPathname rejects foreign user, traversal, non-pdf", () => {
  assert.equal(
    isValidIngestPathname("ingest/other/abc.pdf", "user_1"),
    false,
  );
  assert.equal(
    isValidIngestPathname("ingest/user_1/../x.pdf", "user_1"),
    false,
  );
  assert.equal(
    isValidIngestPathname("ingest/user_1/abc.txt", "user_1"),
    false,
  );
});
