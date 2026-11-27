// WHAT: Unit tests for average→grade band lookup and invalid overlapping scales.
// HOW: Node test runner asserts `mapAverageToGrade` and `lookupDetailedGrade` outputs.
// SCREEN: Grade Calculator result label from class average.
// EDIT: Update expectations when `lib/domain/grade-scale.ts` bands change.
// KEEP: Run via `npm run test:unit`; uses `detailedBandsForScale()` fixture.
// RISK: Low
/**
 * Phase 2 — mapAverageToGrade bands + CONFIG errors.
 * Run: npm run test:unit
 */

import assert from "node:assert/strict";
import { test } from "node:test";

import {
  detailedBandsForScale,
  GradeScaleConfigError,
  lookupDetailedGrade,
  mapAverageToGrade,
} from "../../lib/domain/grade-scale.ts";

const scale = detailedBandsForScale();

test("mapAverageToGrade hits contiguous detailed bands", () => {
  assert.equal(mapAverageToGrade(98, scale), 1.0);
  assert.equal(mapAverageToGrade(94, scale), 1.25);
  assert.equal(mapAverageToGrade(81.25, scale), 2.0);
  assert.equal(mapAverageToGrade(60, scale), 3.0);
  assert.equal(mapAverageToGrade(50, scale), 5.0);
});

test("lookupDetailedGrade returns letter and description", () => {
  const hit = lookupDetailedGrade(86);
  assert.equal(hit.numerical, "1.75");
  assert.equal(hit.letter, "B");
});

test("mapAverageToGrade rejects overlap", () => {
  assert.throws(
    () =>
      mapAverageToGrade(70, [
        { minAverage: 0, maxAverage: 70, grade: 3 },
        { minAverage: 70, maxAverage: 100, grade: 1 },
      ]),
    GradeScaleConfigError,
  );
});

test("mapAverageToGrade rejects no match", () => {
  assert.throws(
    () =>
      mapAverageToGrade(50, [{ minAverage: 60, maxAverage: 100, grade: 1 }]),
    GradeScaleConfigError,
  );
});
