import "server-only";

// WHAT: API helper — “this week” planner state for one subject.
// HOW: Loads semester + plan weeks + skipped weeks → domain planner getWeekState.
// SCREEN: This Week card / GET subject week endpoint.
// EDIT: todayISO source (Manila) in caller/service.
// KEEP: Read-only derivation — no DB writes.
// RISK: High — reads DB; must enforce ownership on subject.

/**
 * Derived planner week state for a subject (Appendix B GET …/week).
 */

import { getWeekState, type WeekState } from "@/lib/domain/planner";
import { parseSkippedWeeks } from "@/lib/services/mappers";
import { db } from "@/lib/db";
import { requireOwnedSubject } from "@/lib/db/ownership-guards";
import { notFound } from "@/lib/http/errors";
import { getTodayManilaISO, toManilaDateISO } from "@/lib/time/manila";

/** Compute This Week state in Asia/Manila. */
export async function getSubjectWeekState(
  userId: string,
  subjectId: string,
  todayISO: string = getTodayManilaISO(),
): Promise<WeekState & { todayISO: string }> {
  const subject = await requireOwnedSubject(userId, subjectId);

  const semester = await db.orm.public.Semester.where({
    id: subject.semesterId,
    userId,
  }).first();
  if (!semester) throw notFound();

  const planWeeks = await db.orm.public.PlanWeek.where({ subjectId }).all();

  const state = getWeekState(
    todayISO,
    {
      startDateISO: toManilaDateISO(semester.startDate as string | Date),
      endDateISO: toManilaDateISO(semester.endDate as string | Date),
      skippedWeeks: parseSkippedWeeks(semester.skippedWeeks),
    },
    planWeeks.map((w) => ({
      weekNumber: w.weekNumber,
      topic: w.topic,
    })),
  );

  return { ...state, todayISO };
}
