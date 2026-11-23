import "server-only";

/**
 * Ensure / write PlanWeek rows so Checklist is useful for manual + syllabus creates.
 */

import { limits } from "@/lib/config/limits";
import {
  buildPlanWeekSkeleton,
  planWeekCountFromSemester,
  type SkeletonWeek,
} from "@/lib/domain/plan-skeleton";
import { db } from "@/lib/db";
import { requireOwnedSubject } from "@/lib/db/ownership-guards";
import { notFound } from "@/lib/http/errors";
import { listPlanWeeksForSubject } from "@/lib/queries/plan";
import type { PlanWeekDto } from "@/lib/services/mappers";
import { toManilaDateISO } from "@/lib/time/manila";

async function semesterDates(semesterId: string, userId: string) {
  const semester = await db.orm.public.Semester.where({
    id: semesterId,
    userId,
  }).first();
  if (!semester) throw notFound();
  return {
    startDateISO: toManilaDateISO(semester.startDate as string | Date),
    endDateISO: toManilaDateISO(semester.endDate as string | Date),
  };
}

async function writeWeeks(subjectId: string, weeks: SkeletonWeek[]) {
  await db.transaction(async (tx) => {
    const existing = await tx.orm.public.PlanWeek.where({ subjectId }).all();
    for (const row of existing) {
      await tx.orm.public.PlanWeek.where({ id: row.id }).delete();
    }
    for (const week of weeks.slice(0, limits.MAX_PLAN_WEEKS)) {
      await tx.orm.public.PlanWeek.create({
        subjectId,
        weekNumber: week.weekNumber,
        position: week.weekNumber - 1,
        topic: week.topic,
        outcome: week.outcome,
        activities: week.activities,
        status: week.status,
        notes: week.notes,
      });
    }
  });
}

/**
 * Create skeleton weeks for a subject (used right after Subject.create).
 * Overlays optional syllabus topics. Always replaces existing plan rows.
 */
export async function writeSubjectPlanWeeks(
  userId: string,
  subjectId: string,
  topics: Array<{ weekNumber: number; topic?: string | null }> = [],
): Promise<PlanWeekDto[]> {
  const subject = await requireOwnedSubject(userId, subjectId);
  const { startDateISO, endDateISO } = await semesterDates(
    subject.semesterId,
    userId,
  );
  const count = planWeekCountFromSemester(startDateISO, endDateISO);
  const weeks = buildPlanWeekSkeleton(count, topics);
  await writeWeeks(subjectId, weeks);
  return listPlanWeeksForSubject(userId, subjectId);
}

/**
 * If the subject has no PlanWeek rows, generate a blank skeleton from semester dates.
 * Idempotent when plan already exists.
 */
export async function ensurePlanWeekSkeleton(
  userId: string,
  subjectId: string,
): Promise<PlanWeekDto[]> {
  await requireOwnedSubject(userId, subjectId);
  const existing = await db.orm.public.PlanWeek.where({ subjectId }).all();
  if (existing.length > 0) {
    return listPlanWeeksForSubject(userId, subjectId);
  }
  return writeSubjectPlanWeeks(userId, subjectId, []);
}
