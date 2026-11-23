/**
 * Phase 1 — normalizeCourseCode pure helpers.
 * Run: npm run test:unit
 */

import assert from "node:assert/strict";
import { test } from "node:test";

import {
  courseCodeMatches,
  normalizeCourseCode,
} from "../../lib/domain/course-code.ts";

test("normalizeCourseCode trims, collapses spaces, uppercases", () => {
  assert.equal(normalizeCourseCode("  cis  101 "), "CIS 101");
  assert.equal(normalizeCourseCode("eng-2a"), "ENG-2A");
});

test("courseCodeMatches accepts display or normalized confirmation", () => {
  assert.equal(courseCodeMatches("CIS 101", "CIS 101", "cis  101"), true);
  assert.equal(courseCodeMatches("CIS 101", "CIS 101", "CIS102"), false);
});
