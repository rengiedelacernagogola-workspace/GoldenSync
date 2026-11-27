// WHAT: Throw 404 unless a row belongs to the signed-in user’s semester tree.
// HOW: Load by id, then verify semester.userId or parent subject ownership.
// EDIT: Add requireOwned* for new child tables following the two-step pattern.
// KEEP: RULE — never find Semester/Subject/Assessment/Score by id alone without user check.
// RISK: High — authentication/authorization; skips here are IDOR vulnerabilities.

/**
 * Ownership DB guards — two-step scalar FK checks.
 * RULE: never find by id alone on Semester/Subject/Assessment/Score.
 *
 * Prisma Composer where() rejects nested relation filters
 * (`semester: { userId }` → "Model Subject has no field semester").
 */

import "server-only";

import { db } from "@/lib/db/client";
import { notFound } from "@/lib/http/errors";

/** Subject row when its semester belongs to userId; else 404. */
export async function requireOwnedSubject(userId: string, subjectId: string) {
  const subject = await db.orm.public.Subject.where({ id: subjectId }).first();
  if (!subject) throw notFound();
  const semester = await db.orm.public.Semester.where({
    id: subject.semesterId,
    userId,
  }).first();
  if (!semester) throw notFound();
  return subject;
}

/** Assessment row when its subject→semester belongs to userId; else 404. */
export async function requireOwnedAssessment(
  userId: string,
  assessmentId: string,
) {
  const assessment = await db.orm.public.Assessment.where({
    id: assessmentId,
  }).first();
  if (!assessment) throw notFound();
  await requireOwnedSubject(userId, assessment.subjectId);
  return assessment;
}
