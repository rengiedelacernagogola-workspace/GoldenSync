// WHAT: Tests `getWeekState` — before start, after end, skipped week, no plan cases.
// HOW: Fixed semester + plan fixtures; assert `kind` and derived fields per calendar date.
// SCREEN: This Week module headline and preview topic.
// EDIT: When planner rules or skipped-week math change in `lib/domain/planner.ts`.
// KEEP: Dates are ISO strings — timezone logic lives in domain, not tests.
// RISK: Low
/**
 * Phase 2 — getWeekState pure planner (architecture §10.2).
 * Run: npm run test:unit
 */

import assert from "node:assert/strict";
import { test } from "node:test";

import { getWeekState } from "../../lib/domain/planner.ts";

const semester = {
  startDateISO: "2026-08-10",
  endDateISO: "2026-12-12",
  skippedWeeks: [13],
};

const plan = [
  { weekNumber: 1, topic: "Intro" },
  { weekNumber: 2, topic: "Basics" },
  { weekNumber: 14, topic: "After break" },
];

test("BEFORE_START reports days until start and Week 1 preview", () => {
  const s = getWeekState("2026-08-03", semester, plan);
  assert.equal(s.kind, "BEFORE_START");
  assert.equal(s.daysUntilStart, 7);
  assert.equal(s.nextTopic, "Intro");
});

test("AFTER_END when today past endDate", () => {
  const s = getWeekState("2026-12-13", semester, plan);
  assert.equal(s.kind, "AFTER_END");
});

test("NO_CLASS on skipped week with next topic", () => {
  // start 2026-08-10 → week 13 starts day 84 = 2026-11-02
  const s = getWeekState("2026-11-02", semester, plan);
  assert.equal(s.kind, "NO_CLASS");
  assert.equal(s.weekNumber, 13);
  assert.equal(s.nextTopic, "After break");
});

test("NO_PLAN_FOR_WEEK when no plan row", () => {
  const s = getWeekState("2026-08-24", semester, plan); // week 3
  assert.equal(s.kind, "NO_PLAN_FOR_WEEK");
  assert.equal(s.weekNumber, 3);
});

test("NORMAL returns topic for current week", () => {
  const s = getWeekState("2026-08-10", semester, plan);
  assert.equal(s.kind, "NORMAL");
  assert.equal(s.weekNumber, 1);
  assert.equal(s.topic, "Intro");
});
