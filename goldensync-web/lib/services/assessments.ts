import "server-only";

// WHAT: Create/update/delete assessments (scored activities) on a subject.
// HOW: Ownership via subject; stores maxScore as decimal string.
// SCREEN: Assessments / activities list on subject.
// EDIT: Limits on count per subject from config.
// KEEP: Tied to outcomes for grade engine inputs.
// RISK: High — database writes.

/**
 * Assessment (activity) write use-cases (Phase 1 / Appendix B).
 */

import { limits } from "@/lib/config/limits";
import { maxScoreToDecimalString } from "@/lib/domain/units";
import { db } from "@/lib/db";
import {
  requireOwnedAssessment,
  requireOwnedSubject,
} from "@/lib/db/ownership-guards";
import { AppError, validationFailed } from "@/lib/http/errors";
import {
  getAssessmentForUser,
  listAssessmentsForSubject,
} from "@/lib/queries/assessments";
import { mapAssessment, type AssessmentDto } from "@/lib/services/mappers";
import type {
  CreateAssessmentInput,
  PatchAssessmentInput,
} from "@/lib/validation/assessment";

export { getAssessmentForUser, listAssessmentsForSubject };

/** Ensure outcomeIds all belong to subjectId. */
async function assertOutcomesOnSubject(
  subjectId: string,
  outcomeIds: string[],
) {
  if (outcomeIds.length === 0) return;
  const rows = await db.orm.public.Outcome.where({ subjectId }).all();
  const owned = new Set(rows.map((o) => o.id));
  if (outcomeIds.some((id) => !owned.has(id))) {
    throw validationFailed("One or more outcomeIds are not on this subject.");
  }
}

/** Replace AssessmentOutcome rows for an assessment. */
async function replaceOutcomeLinks(
  assessmentId: string,
  outcomeIds: string[],
) {
  const existing = await db.orm.public.AssessmentOutcome.where({
    assessmentId,
  }).all();
  for (const row of existing) {
    await db.orm.public.AssessmentOutcome.where({
      assessmentId: row.assessmentId,
      outcomeId: row.outcomeId,
    }).delete();
  }
  for (const outcomeId of outcomeIds) {
    await db.orm.public.AssessmentOutcome.create({
      assessmentId,
      outcomeId,
    });
  }
}

/** Add an activity under an owned subject (max 150). */
export async function createAssessment(
  userId: string,
  subjectId: string,
  input: CreateAssessmentInput,
): Promise<AssessmentDto> {
  await requireOwnedSubject(userId, subjectId);

  const existing = await db.orm.public.Assessment.where({ subjectId }).all();
  if (existing.length >= limits.MAX_ACTIVITIES) {
    throw new AppError(
      "LIMIT_REACHED",
      `At most ${limits.MAX_ACTIVITIES} activities per subject.`,
    );
  }

  await assertOutcomesOnSubject(subjectId, input.outcomeIds);

  const position =
    input.position ??
    (existing.length === 0
      ? 0
      : Math.max(...existing.map((a) => a.position)) + 1);

  const row = await db.orm.public.Assessment.create({
    subjectId,
    label: input.label,
    maxScore: maxScoreToDecimalString(input.maxScore),
    position,
  });

  if (input.outcomeIds.length > 0) {
    await replaceOutcomeLinks(row.id, input.outcomeIds);
  }

  return mapAssessment(row);
}

/** Patch owned assessment; optionally remaps outcomes. */
export async function updateAssessment(
  userId: string,
  assessmentId: string,
  input: PatchAssessmentInput,
): Promise<AssessmentDto> {
  const current = await requireOwnedAssessment(userId, assessmentId);

  if (input.outcomeIds) {
    await assertOutcomesOnSubject(current.subjectId, input.outcomeIds);
  }

  await db.orm.public.Assessment.where({ id: assessmentId }).update({
    ...(input.label !== undefined ? { label: input.label } : {}),
    ...(input.maxScore !== undefined
      ? { maxScore: maxScoreToDecimalString(input.maxScore) }
      : {}),
    ...(input.position !== undefined ? { position: input.position } : {}),
  });

  if (input.outcomeIds) {
    await replaceOutcomeLinks(assessmentId, input.outcomeIds);
  }

  return getAssessmentForUser(userId, assessmentId);
}

/** Delete owned assessment (cascades score + mappings). */
export async function deleteAssessment(
  userId: string,
  assessmentId: string,
): Promise<void> {
  await requireOwnedAssessment(userId, assessmentId);
  await db.orm.public.Assessment.where({ id: assessmentId }).delete();
}
