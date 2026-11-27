// WHAT: Asserts optimistic-lock score updates return HTTP 409 `CONFLICT_VERSION`.
// HOW: Instantiates `AppError` and checks status + code.
// SCREEN: Calculator / score row — “reload and enter again” conflict banner.
// EDIT: When error taxonomy changes in `lib/http/errors.ts`.
// KEEP: Must stay aligned with appendix A `calculator.conflict` copy.
// RISK: Low
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
