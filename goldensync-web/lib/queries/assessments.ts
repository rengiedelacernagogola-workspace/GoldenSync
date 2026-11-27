import "server-only";

// WHAT: List assessments for subject or load one with ownership.
// HOW: requireOwnedSubject / requireOwnedAssessment patterns.
// SCREEN: Assessments and scores UI.
// EDIT: Include outcome relation if UI needs CO codes.
// KEEP: Decimal fields as strings in DTOs via mappers.
// RISK: High — database + ownership.

/**
 * Assessment (activity) reads — scoped by owner.
 */

import { db } from "@/lib/db";
import {
  requireOwnedAssessment,
  requireOwnedSubject,
} from "@/lib/db/ownership-guards";
import { mapAssessment, type AssessmentDto } from "@/lib/services/mappers";

/** List assessments for an owned subject. */
export async function listAssessmentsForSubject(
  userId: string,
  subjectId: string,
): Promise<AssessmentDto[]> {
  await requireOwnedSubject(userId, subjectId);

  const rows = await db.orm.public.Assessment.where({ subjectId }).all();
  return rows
    .map(mapAssessment)
    .sort((a, b) => a.position - b.position || a.label.localeCompare(b.label));
}

/** One assessment if owned; else 404. */
export async function getAssessmentForUser(
  userId: string,
  assessmentId: string,
): Promise<AssessmentDto> {
  const row = await requireOwnedAssessment(userId, assessmentId);
  return mapAssessment(row);
}
