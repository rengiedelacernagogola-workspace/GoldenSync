import "server-only";

// WHAT: Create, update, confirm-delete subjects under owned semesters.
// HOW: Parses policies/faculty JSON via domain helpers; triggers plan skeleton.
// SCREEN: Subject forms, ingest confirm, subject settings.
// EDIT: createSubject vs patchSubject field lists.
// KEEP: requireOwnedSubject / semester ownership on every mutation.
// RISK: High — database; JSON columns easy to corrupt.

/**
 * Subject write use-cases — manual create / edit / soft-archive delete (Phase 1).
 */

import { limits } from "@/lib/config/limits";
import {
  courseCodeMatches,
  normalizeCourseCode,
} from "@/lib/domain/course-code";
import { isSemesterPast } from "@/lib/domain/semester-year";
import {
  maxScoreToDecimalString,
  unitsToDecimalString,
} from "@/lib/domain/units";
import { db } from "@/lib/db";
import { requireOwnedSubject } from "@/lib/db/ownership-guards";
import { AppError, notFound } from "@/lib/http/errors";
import {
  getSubjectDetailForUser,
  getSubjectForUser,
  listSubjectsForSemester,
} from "@/lib/queries/subjects";
import { mapSubject, type SubjectDto } from "@/lib/services/mappers";
import { writeSubjectPlanWeeks } from "@/lib/services/plan-skeleton";
import type {
  CreateSubjectInput,
  DeleteSubjectInput,
  PatchSubjectInput,
} from "@/lib/validation/subject";

export { getSubjectDetailForUser, getSubjectForUser, listSubjectsForSemester };

/** Create an active subject in an owned semester (+ PlanWeek skeleton). */
export async function createSubject(
  userId: string,
  input: CreateSubjectInput,
): Promise<SubjectDto> {
  const semester = await db.orm.public.Semester.where({
    id: input.semesterId,
    userId,
  }).first();
  if (!semester) throw notFound();
  if (isSemesterPast(semester.endDate)) {
    throw new AppError(
      "VALIDATION_FAILED",
      "Past semesters are view-only. Archive or delete subjects instead of adding new ones.",
    );
  }

  const active = await db.orm.public.Subject.where({
    semesterId: input.semesterId,
    archivedAt: null,
  }).all();
  if (active.length >= limits.MAX_ACTIVE_SUBJECTS_PER_SEMESTER) {
    throw new AppError(
      "LIMIT_REACHED",
      `At most ${limits.MAX_ACTIVE_SUBJECTS_PER_SEMESTER} active subjects per semester.`,
    );
  }

  const courseCodeNorm = normalizeCourseCode(input.courseCode);
  const dup = active.find((s) => s.courseCodeNorm === courseCodeNorm);
  if (dup) {
    throw new AppError(
      "DUPLICATE_COURSE_CODE",
      "An active subject with this course code already exists in the semester.",
      { courseCodeNorm },
    );
  }

  const row = await db.orm.public.Subject.create({
    semesterId: input.semesterId,
    courseCode: input.courseCode.trim(),
    courseCodeNorm,
    title: input.title,
    units: unitsToDecimalString(input.units),
    prerequisite: input.prerequisite ?? null,
    effectivity: input.effectivity ?? null,
    ...(input.grading !== undefined
      ? { grading: structuredClone(input.grading) as never }
      : {}),
    ...(input.policies !== undefined
      ? { policies: structuredClone(input.policies) as never }
      : {}),
    ...(input.faculty !== undefined
      ? { faculty: structuredClone(input.faculty) as never }
      : {}),
  });

  try {
    /** Checklist stays useful: blank weeks for manual, topics overlaid for syllabus. */
    await writeSubjectPlanWeeks(userId, row.id, input.planWeeks ?? []);

    const outcomes = input.outcomes ?? [];
    if (outcomes.length > 0) {
      const seenOutcome = new Set<string>();
      for (let i = 0; i < outcomes.length; i++) {
        const item = outcomes[i]!;
        const code = item.code.replace(/\s+/g, "").toUpperCase().slice(0, 24);
        const key = `${item.kind}:${code}`;
        if (!code || seenOutcome.has(key)) continue;
        seenOutcome.add(key);
        await db.orm.public.Outcome.create({
          subjectId: row.id,
          kind: item.kind,
          code,
          description: item.description,
          position: item.position ?? i,
        });
      }
    }

    const assessments = input.assessments ?? [];
    for (let i = 0; i < assessments.length; i++) {
      const item = assessments[i]!;
      const maxRaw = item.maxScore;
      const maxScore =
        maxRaw == null || String(maxRaw).trim() === ""
          ? "100.00"
          : maxScoreToDecimalString(maxRaw);
      await db.orm.public.Assessment.create({
        subjectId: row.id,
        label: item.label,
        maxScore,
        position: item.position ?? i,
      });
    }
  } catch (err) {
    await db.orm.public.Subject.where({ id: row.id }).delete();
    throw err;
  }

  return mapSubject(row);
}

/** Patch owned subject; re-checks duplicate code when courseCode changes. */
export async function updateSubject(
  userId: string,
  subjectId: string,
  input: PatchSubjectInput,
): Promise<SubjectDto> {
  const current = await requireOwnedSubject(userId, subjectId);
  const semester = await db.orm.public.Semester.where({
    id: current.semesterId,
    userId,
  }).first();
  if (!semester) throw notFound();
  if (isSemesterPast(semester.endDate)) {
    throw new AppError(
      "VALIDATION_FAILED",
      "Past semesters are view-only. Archive or delete subjects instead of editing.",
    );
  }

  let courseCodeNorm = current.courseCodeNorm;
  let courseCode = current.courseCode;
  if (input.courseCode !== undefined) {
    courseCode = input.courseCode.trim();
    courseCodeNorm = normalizeCourseCode(courseCode);
    if (courseCodeNorm !== current.courseCodeNorm && !current.archivedAt) {
      const siblings = await db.orm.public.Subject.where({
        semesterId: current.semesterId,
        archivedAt: null,
      }).all();
      if (siblings.some((s) => s.id !== subjectId && s.courseCodeNorm === courseCodeNorm)) {
        throw new AppError(
          "DUPLICATE_COURSE_CODE",
          "An active subject with this course code already exists in the semester.",
          { courseCodeNorm },
        );
      }
    }
  }

  await db.orm.public.Subject.where({ id: subjectId }).update({
    ...(input.courseCode !== undefined ? { courseCode, courseCodeNorm } : {}),
    ...(input.title !== undefined ? { title: input.title } : {}),
    ...(input.units !== undefined
      ? { units: unitsToDecimalString(input.units) }
      : {}),
    ...(input.prerequisite !== undefined
      ? { prerequisite: input.prerequisite }
      : {}),
    ...(input.effectivity !== undefined
      ? { effectivity: input.effectivity }
      : {}),
    ...(input.grading !== undefined
      ? { grading: structuredClone(input.grading) as never }
      : {}),
    ...(input.policies !== undefined
      ? { policies: structuredClone(input.policies) as never }
      : {}),
    ...(input.faculty !== undefined
      ? { faculty: structuredClone(input.faculty) as never }
      : {}),
  });

  return getSubjectForUser(userId, subjectId);
}

/**
 * Soft-delete (archive) subject — requires confirmCourseCode match.
 * Hard delete left for account wipe / later ops.
 */
export async function deleteSubject(
  userId: string,
  subjectId: string,
  input: DeleteSubjectInput,
): Promise<void> {
  const current = await requireOwnedSubject(userId, subjectId);

  if (
    !courseCodeMatches(
      current.courseCode,
      current.courseCodeNorm,
      input.confirmCourseCode,
    )
  ) {
    throw new AppError(
      "VALIDATION_FAILED",
      "Course code confirmation does not match.",
    );
  }

  await db.orm.public.Subject.where({ id: subjectId }).update({
    archivedAt: new Date(),
  });
}
