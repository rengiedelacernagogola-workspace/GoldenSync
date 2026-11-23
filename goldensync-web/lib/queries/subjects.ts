import "server-only";

/**
 * Subject reads — always scoped by owner via semester.userId.
 */

import { db } from "@/lib/db";
import { requireOwnedSubject } from "@/lib/db/ownership-guards";
import {
  mapAssessment,
  mapChecklistItem,
  mapOutcome,
  mapPlanWeek,
  mapSubject,
  type SubjectDetailDto,
  type SubjectDto,
} from "@/lib/services/mappers";
import { notFound } from "@/lib/http/errors";

/** Active (non-archived) subjects in a semester the user owns. */
export async function listSubjectsForSemester(
  userId: string,
  semesterId: string,
): Promise<SubjectDto[]> {
  const semester = await db.orm.public.Semester.where({
    id: semesterId,
    userId,
  }).first();
  if (!semester) throw notFound();

  const rows = await db.orm.public.Subject.where({
    semesterId,
    archivedAt: null,
  }).all();

  return rows.map(mapSubject).sort((a, b) => a.courseCodeNorm.localeCompare(b.courseCodeNorm));
}

/** One subject if owned; else 404. */
export async function getSubjectForUser(
  userId: string,
  subjectId: string,
): Promise<SubjectDto> {
  const row = await requireOwnedSubject(userId, subjectId);
  return mapSubject(row);
}

/** Owned subject with outcomes, plan, assessments, checklist + semester label. */
export async function getSubjectDetailForUser(
  userId: string,
  subjectId: string,
): Promise<SubjectDetailDto> {
  const row = await requireOwnedSubject(userId, subjectId);

  const [outcomes, planWeeks, assessments, checklist, semester] =
    await Promise.all([
      db.orm.public.Outcome.where({ subjectId }).all(),
      db.orm.public.PlanWeek.where({ subjectId }).all(),
      db.orm.public.Assessment.where({ subjectId }).all(),
      db.orm.public.ChecklistItem.where({ subjectId }).all(),
      db.orm.public.Semester.where({ id: row.semesterId, userId }).first(),
    ]);

  return {
    ...mapSubject(row),
    semesterLabel: semester?.label ?? "—",
    outcomes: outcomes
      .map(mapOutcome)
      .sort((a, b) => a.position - b.position || a.code.localeCompare(b.code)),
    planWeeks: planWeeks
      .map(mapPlanWeek)
      .sort(
        (a, b) =>
          a.weekNumber - b.weekNumber || a.position - b.position,
      ),
    assessments: assessments
      .map(mapAssessment)
      .sort(
        (a, b) => a.position - b.position || a.label.localeCompare(b.label),
      ),
    checklist: checklist
      .map(mapChecklistItem)
      .sort((a, b) => a.weekNumber - b.weekNumber),
  };
}
