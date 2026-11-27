// WHAT: Tests decimal string formatting for subject units and assessment max scores.
// HOW: `unitsToDecimalString` / `maxScoreToDecimalString` equality assertions.
// SCREEN: Subject form units field and assessment max score persistence.
// EDIT: Format rules in `lib/domain/units.ts` (Prisma Decimal compatibility).
// KEEP: DB stores Decimal — strings must match DB driver expectations.
// RISK: Low
/**
 * Phase 1 — unitsToDecimalString.
 * Run: npm run test:unit
 */

import assert from "node:assert/strict";
import { test } from "node:test";

import {
  maxScoreToDecimalString,
  unitsToDecimalString,
} from "../../lib/domain/units.ts";

test("unitsToDecimalString formats number and string", () => {
  assert.equal(unitsToDecimalString(3), "3.0");
  assert.equal(unitsToDecimalString(1.5), "1.5");
  assert.equal(unitsToDecimalString("2"), "2.0");
});

test("maxScoreToDecimalString formats to two decimals", () => {
  assert.equal(maxScoreToDecimalString(50), "50.00");
  assert.equal(maxScoreToDecimalString("12.5"), "12.50");
});
