/**
 * Phase 2 — grade engine six vectors (architecture §10.1).
 * Two activities per outcome @ 50 max → percent ≈ total score out of 100.
 * Run: npm run test:unit
 */

import assert from "node:assert/strict";
import { test } from "node:test";

import {
  computeGrade,
  type OutcomeScoreInput,
} from "../../lib/domain/grade-engine.ts";

/** Build four CO inputs from percent scores (each = two×50-max activities). */
function fromPercents(
  values: (number | null)[],
): OutcomeScoreInput[] {
  return values.map((pct, i) => {
    const id = `CO${i + 1}`;
    if (pct === null) return { outcomeId: id, activities: [] };
    return {
      outcomeId: id,
      activities: [
        { score: pct / 2, max: 50 },
        { score: pct / 2, max: 50 },
      ],
    };
  });
}

test("vector A — all attained → PASSED", () => {
  const r = computeGrade(fromPercents([85, 78, 72, 90]));
  assert.equal(r.status, "PASSED");
  assert.equal(r.average, 81.25);
  assert.deepEqual(r.weakOutcomeIds, []);
});

test("vector B — average > 60, weak CO3 → INTERVENTION_A", () => {
  const r = computeGrade(fromPercents([80, 75, 55, 90]));
  assert.equal(r.status, "INTERVENTION_A");
  assert.equal(r.average, 75);
  assert.deepEqual(r.weakOutcomeIds, ["CO3"]);
});

test("vector C — average == 60 → UNDEFINED_AT_THRESHOLD", () => {
  const r = computeGrade(fromPercents([70, 50, 70, 50]));
  assert.equal(r.status, "UNDEFINED_AT_THRESHOLD");
  assert.equal(r.average, 60);
});

test("vector D — avg < 60, half attained → INTERVENTION_B", () => {
  const r = computeGrade(fromPercents([70, 65, 40, 45]));
  assert.equal(r.status, "INTERVENTION_B");
  assert.equal(r.average, 55);
  assert.equal(r.suggestedGrade, 3.0);
});

test("vector E — avg < 60, few attained → FAILED", () => {
  const r = computeGrade(fromPercents([70, 40, 45, 50]));
  assert.equal(r.status, "FAILED");
  assert.equal(r.average, 51.25);
  assert.equal(r.suggestedGrade, 5.0);
});

test("vector F — unscored outcome → INCOMPLETE", () => {
  const r = computeGrade(fromPercents([85, 78, 72, null]));
  assert.equal(r.status, "INCOMPLETE");
  assert.equal(r.average, null);
  assert.equal(r.outcomes[3]?.scored, false);
});

test("reordering activities does not change status", () => {
  const a = computeGrade([
    {
      outcomeId: "CO1",
      activities: [
        { score: 40, max: 50 },
        { score: 30, max: 50 },
      ],
    },
  ]);
  const b = computeGrade([
    {
      outcomeId: "CO1",
      activities: [
        { score: 30, max: 50 },
        { score: 40, max: 50 },
      ],
    },
  ]);
  assert.equal(a.status, b.status);
  assert.equal(a.average, b.average);
});
