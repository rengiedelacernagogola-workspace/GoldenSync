/**
 * WHAT: Unit tests for My Schedule domain helpers (times, overlap, status).
 * Run: npm run test:unit -- tests/unit/schedule.test.ts
 */

import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  classStatusForNow,
  durationMinutes,
  findOverlapConflict,
  formatDuration,
  formatNextIn,
  isEndAfterStart,
  parseTimeToMinutes,
  pickNextClassId,
} from "../../lib/domain/schedule.ts";

describe("schedule domain", () => {
  it("parses HH:mm and rejects junk", () => {
    assert.equal(parseTimeToMinutes("09:30"), 9 * 60 + 30);
    assert.equal(parseTimeToMinutes("24:00"), null);
    assert.equal(parseTimeToMinutes("9:30"), null);
  });

  it("requires end after start and formats duration", () => {
    assert.equal(isEndAfterStart("08:00", "09:30"), true);
    assert.equal(isEndAfterStart("09:00", "09:00"), false);
    assert.equal(durationMinutes("08:00", "09:30"), 90);
    assert.equal(formatDuration("08:00", "09:30"), "1h 30m");
    assert.equal(formatDuration("10:00", "10:45"), "45m");
  });

  it("detects overlap and ignores the edited id", () => {
    const existing = [
      {
        id: "a",
        dayOfWeek: 1,
        startTime: "08:00",
        endTime: "09:00",
        courseCode: "ITE 14",
        courseTitle: "Integrative",
      },
      {
        id: "b",
        dayOfWeek: 1,
        startTime: "10:00",
        endTime: "11:00",
        courseCode: "CSC 101",
        courseTitle: "Intro",
      },
    ];
    const hit = findOverlapConflict(
      { dayOfWeek: 1, startTime: "08:30", endTime: "09:30" },
      existing,
    );
    assert.equal(hit?.id, "a");

    const self = findOverlapConflict(
      { dayOfWeek: 1, startTime: "08:00", endTime: "09:00", excludeId: "a" },
      existing,
    );
    assert.equal(self, null);

    const otherDay = findOverlapConflict(
      { dayOfWeek: 2, startTime: "08:30", endTime: "09:30" },
      existing,
    );
    assert.equal(otherDay, null);
  });

  it("computes ongoing / next status and next id", () => {
    assert.deepEqual(classStatusForNow("08:00", "09:00", 8 * 60 + 15), {
      kind: "ongoing",
    });
    assert.deepEqual(classStatusForNow("10:00", "11:00", 8 * 60), {
      kind: "next",
      minutesUntil: 120,
    });
    assert.equal(classStatusForNow("08:00", "09:00", 10 * 60).kind, "finished");

    const next = pickNextClassId(
      [
        { id: "done", startTime: "07:00", endTime: "08:00" },
        { id: "soon", startTime: "10:00", endTime: "11:00" },
        { id: "later", startTime: "13:00", endTime: "14:00" },
      ],
      9 * 60,
    );
    assert.equal(next, "soon");
    assert.equal(formatNextIn(90), "Next · in 1h 30m");
  });
});
