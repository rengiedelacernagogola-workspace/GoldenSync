// WHAT: Validates API replace-plan payload — duplicate week numbers allowed.
// HOW: Zod `replacePlanSchema.safeParse` success/failure assertions.
// SCREEN: Learning Plan bulk replace / import validation errors.
// EDIT: When `lib/validation/plan.ts` schema rules change.
// KEEP: Duplicates match DB/product — multiple topics can share one weekNumber.
// RISK: Low
/**
 * Phase 1 — replacePlanSchema allows duplicate week numbers.
 * Run: npm run test:unit
 */

import assert from "node:assert/strict";
import { test } from "node:test";

import { replacePlanSchema } from "../../lib/validation/plan.ts";

test("replacePlanSchema accepts unique weekNumbers", () => {
  const parsed = replacePlanSchema.safeParse({
    weeks: [
      { weekNumber: 1, topic: "Intro" },
      { weekNumber: 2, topic: "Next" },
    ],
  });
  assert.equal(parsed.success, true);
});

test("replacePlanSchema accepts duplicate weekNumbers", () => {
  const parsed = replacePlanSchema.safeParse({
    weeks: [
      { weekNumber: 1, topic: "A" },
      { weekNumber: 1, topic: "B" },
    ],
  });
  assert.equal(parsed.success, true);
});
