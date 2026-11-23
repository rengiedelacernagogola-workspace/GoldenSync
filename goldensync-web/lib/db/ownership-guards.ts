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
