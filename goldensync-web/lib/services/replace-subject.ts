import "server-only";

// WHAT: Swap a subject row while preserving scores that still match assessments.
// HOW: Transactional archive + create + score copy; course code normalization.
// SCREEN: Replace subject flow (same semester).
// EDIT: What data copies vs resets — high business impact.
// KEEP: Block when semester past or code confirmation fails.
// RISK: High — database transaction; partial failure needs careful handling.

/**
 * Replace subject: archive old, insert new, copy matching scores (architecture §7.4).
 */

import { normalizeCourseCode } from "@/lib/domain/course-code";
import { isSemesterPast } from "@/lib/domain/semester-year";
import { unitsToDecimalString } from "@/lib/domain/units";
import { db } from "@/lib/db";
import { requireOwnedSubject } from "@/lib/db/ownership-guards";
import { AppError, notFound } from "@/lib/http/errors";
import { getSubjectDetailForUser } from "@/lib/queries/subjects";
import type { SubjectDetailDto } from "@/lib/services/mappers";
import { writeSubjectPlanWeeks } from "@/lib/services/plan-skeleton";
import type { CreateSubjectInput } from "@/lib/validation/subject";

export type ReplaceResult = {
  subject: SubjectDetailDto;
  copied: number;
  skipped: number;
};

/**
 * Archive `subjectId` and create a replacement in the same semester.
 * Copies scores where activity label + maxScore match on the new side
 * when recreating the prior assessment set.
 */
export async function replaceSubject(
  userId: string,
  subjectId: string,
  input: Omit<CreateSubjectInput, "semesterId">,
): Promise<ReplaceResult> {
  const old = await requireOwnedSubject(userId, subjectId);
  if (old.archivedAt) {
    throw new AppError(
      "VALIDATION_FAILED",
      "Cannot replace an archived subject.",
    );
  }
  const semester = await db.orm.public.Semester.where({
    id: old.semesterId,
    userId,
  }).first();
  if (!semester) throw notFound();
  if (isSemesterPast(semester.endDate)) {
    throw new AppError(
      "VALIDATION_FAILED",
      "Past semesters are view-only. Archive or delete subjects instead of replacing.",
    );
  }

  const oldAssessments = await db.orm.public.Assessment.where({
    subjectId,
  }).all();

  type Prior = {
    label: string;
    maxScore: string;
    position: number;
    score: string | null;
    max: string;
  };
  const priors: Prior[] = [];
  for (const a of oldAssessments) {
    const score = await db.orm.public.Score.where({
      assessmentId: a.id,
    }).first();
    priors.push({
      label: a.label,
      maxScore: String(a.maxScore),
      position: a.position,
      score: score?.score == null ? null : String(score.score),
      max: score ? String(score.max) : String(a.maxScore),
    });
  }

  let copied = 0;
  let skipped = 0;
  let newId = "";

  await db.transaction(async (tx) => {
    await tx.orm.public.Subject.where({ id: subjectId }).update({
      archivedAt: new Date(),
    });

    const created = await tx.orm.public.Subject.create({
      semesterId: old.semesterId,
      courseCode: input.courseCode.trim(),
      courseCodeNorm: normalizeCourseCode(input.courseCode),
      title: input.title,
      units: unitsToDecimalString(input.units),
      prerequisite: input.prerequisite ?? null,
      effectivity: input.effectivity ?? null,
    });
    newId = created.id;

    for (const prior of priors) {
      const assessment = await tx.orm.public.Assessment.create({
        subjectId: created.id,
        label: prior.label,
        maxScore: prior.maxScore,
        position: prior.position,
      });
      if (prior.score !== null || prior.max) {
        await tx.orm.public.Score.create({
          assessmentId: assessment.id,
          score: prior.score,
          max: prior.max,
          version: 1,
        });
        copied += 1;
      } else {
        skipped += 1;
      }
    }
  });

  try {
    await writeSubjectPlanWeeks(userId, newId, []);
  } catch (err) {
    await db.orm.public.Subject.where({ id: newId }).delete();
    throw err;
  }
  const subject = await getSubjectDetailForUser(userId, newId);
  return { subject, copied, skipped };
}
