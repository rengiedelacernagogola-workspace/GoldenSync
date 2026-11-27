// WHAT: Validates API replace-plan payload — unique week numbers required.
// HOW: Zod `replacePlanSchema.safeParse` success/failure assertions.
// SCREEN: Learning Plan bulk replace / import validation errors.
// EDIT: When `lib/validation/plan.ts` schema rules change (note: DB allows duplicate weeks via SQL).
// KEEP: Schema duplicate rule may differ from DB `position` model — intentional legacy check.
// RISK: Low
/**
 * Phase 1 — replacePlanSchema rejects duplicate week numbers.
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

test("replacePlanSchema rejects duplicate weekNumbers", () => {
  const parsed = replacePlanSchema.safeParse({
    weeks: [
      { weekNumber: 1, topic: "A" },
      { weekNumber: 1, topic: "B" },
    ],
  });
  assert.equal(parsed.success, false);
});
