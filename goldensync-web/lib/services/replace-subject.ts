import "server-only";

/**
 * Replace subject: archive old, insert new, copy matching scores (architecture §7.4).
 */

import { normalizeCourseCode } from "@/lib/domain/course-code";
import { unitsToDecimalString } from "@/lib/domain/units";
import { db } from "@/lib/db";
import { requireOwnedSubject } from "@/lib/db/ownership-guards";
import { AppError } from "@/lib/http/errors";
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

  await writeSubjectPlanWeeks(userId, newId, []);
  const subject = await getSubjectDetailForUser(userId, newId);
  return { subject, copied, skipped };
}
