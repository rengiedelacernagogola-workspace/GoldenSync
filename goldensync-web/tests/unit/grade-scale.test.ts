/**
 * Phase 2 — mapAverageToGrade bands + CONFIG errors.
 * Run: npm run test:unit
 */

import assert from "node:assert/strict";
import { test } from "node:test";

import {
  GradeScaleConfigError,
  mapAverageToGrade,
} from "../../lib/domain/grade-scale.ts";

const scale = [
  { minAverage: 0, maxAverage: 59.99, grade: 5.0 },
  { minAverage: 60, maxAverage: 74.99, grade: 3.0 },
  { minAverage: 75, maxAverage: 100, grade: 1.0 },
];

test("mapAverageToGrade hits contiguous bands", () => {
  assert.equal(mapAverageToGrade(81.25, scale), 1.0);
  assert.equal(mapAverageToGrade(60, scale), 3.0);
  assert.equal(mapAverageToGrade(50, scale), 5.0);
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
