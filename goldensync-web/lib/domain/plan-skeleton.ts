// WHAT: Empty plan week rows for a semester (count + optional syllabus topics).
// HOW: planWeekCountFromSemester uses start/end dates; buildPlanWeekSkeleton fills rows.
// SCREEN: New plan / syllabus confirm before rows are saved to DB.
// EDIT: Default status strings and max week cap (limits.MAX_PLAN_WEEKS).
// KEEP: No database — services persist the skeleton.
// RISK: Low.

/**
 * Plan week skeleton helpers — PURE (no Date / DB).
 * Manual create and syllabus confirm both land on PlanWeek rows.
 */

import { limits } from "@/lib/config/limits";
import { daysBetween } from "@/lib/domain/planner";

export type SkeletonWeek = {
  weekNumber: number;
  topic: string | null;
  outcome: string | null;
  activities: string | null;
  status: "Not started" | "In progress" | "Done" | "No class";
  notes: string | null;
};

/**
 * How many checklist/plan weeks a semester should have.
 * Week 1 = start week; last week = week containing endDate (inclusive).
 */
export function planWeekCountFromSemester(
  startDateISO: string,
  endDateISO: string,
  maxWeeks: number = limits.MAX_PLAN_WEEKS,
): number {
  if (!startDateISO || !endDateISO || endDateISO < startDateISO) {
    return Math.min(18, maxWeeks);
  }
  const spanDays = daysBetween(startDateISO, endDateISO);
  const count = Math.floor(spanDays / 7) + 1;
  return Math.min(maxWeeks, Math.max(1, count));
}

/**
 * Build week rows 1..count, overlaying optional syllabus topics by weekNumber.
 * Extends count up to maxWeeks when topics reference a higher week.
 */
export function buildPlanWeekSkeleton(
  count: number,
  topics: Array<{ weekNumber: number; topic?: string | null }> = [],
  maxWeeks: number = limits.MAX_PLAN_WEEKS,
): SkeletonWeek[] {
  const byWeek = new Map<number, string | null>();
  let highest = count;
  for (const t of topics) {
    if (!Number.isFinite(t.weekNumber) || t.weekNumber < 1) continue;
    const n = Math.min(maxWeeks, Math.floor(t.weekNumber));
    const topic =
      t.topic == null || String(t.topic).trim() === ""
        ? null
        : String(t.topic).trim().slice(0, 500);
    byWeek.set(n, topic);
    if (n > highest) highest = n;
  }
  const total = Math.min(maxWeeks, Math.max(1, highest));
  const weeks: SkeletonWeek[] = [];
  for (let weekNumber = 1; weekNumber <= total; weekNumber++) {
    weeks.push({
      weekNumber,
      topic: byWeek.has(weekNumber) ? (byWeek.get(weekNumber) ?? null) : null,
      outcome: null,
      activities: null,
      status: "Not started",
      notes: null,
    });
  }
  return weeks;
}
