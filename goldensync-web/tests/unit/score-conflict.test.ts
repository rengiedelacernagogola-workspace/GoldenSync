/**
 * Phase 2 — CONFLICT_VERSION AppError shape (architecture §7.5).
 * Run: npm run test:unit
 */

import assert from "node:assert/strict";
import { test } from "node:test";

import { AppError } from "../../lib/http/errors.ts";

test("CONFLICT_VERSION maps to HTTP 409", () => {
  const err = new AppError("CONFLICT_VERSION", "Score version conflict.", {
    assessmentId: "a1",
  });
  assert.equal(err.status, 409);
  assert.equal(err.code, "CONFLICT_VERSION");
});
