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
