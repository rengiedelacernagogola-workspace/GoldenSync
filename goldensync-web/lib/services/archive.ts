import "server-only";

// WHAT: Soft-archive or restore a subject within the restore window.
// HOW: archivedAt timestamp; enforces ARCHIVE_RESTORE_DAYS from limits.
// SCREEN: Subject archive / restore actions.
// EDIT: Window length in limits — product/legal decision.
// KEEP: Distinct from replace-subject and hard delete.
// RISK: High — database; wrong restore logic loses user data visibility.

/**
 * Archive / restore subject within ARCHIVE_RESTORE_DAYS (architecture §7.7 / Appendix B).
 */

import { limits } from "@/lib/config/limits";
import { db } from "@/lib/db";
import { requireOwnedSubject } from "@/lib/db/ownership-guards";
import { AppError } from "@/lib/http/errors";
import { getSubjectForUser } from "@/lib/queries/subjects";
import { mapSubject, type SubjectDto } from "@/lib/services/mappers";

const RESTORE_MS = limits.ARCHIVE_RESTORE_DAYS * 24 * 60 * 60 * 1000;

/** Soft-archive owned subject (sets archivedAt). */
export async function archiveSubject(
  userId: string,
  subjectId: string,
): Promise<SubjectDto> {
  const current = await requireOwnedSubject(userId, subjectId);
  if (current.archivedAt) {
    throw new AppError("VALIDATION_FAILED", "Subject is already archived.");
  }

  await db.orm.public.Subject.where({ id: subjectId }).update({
    archivedAt: new Date(),
  });

  return getSubjectForUser(userId, subjectId);
}

/** Restore if archived within the restore window. */
export async function restoreSubject(
  userId: string,
  subjectId: string,
): Promise<SubjectDto> {
  const current = await requireOwnedSubject(userId, subjectId);
  if (!current.archivedAt) {
    throw new AppError("VALIDATION_FAILED", "Subject is not archived.");
  }

  const archivedAt =
    current.archivedAt instanceof Date
      ? current.archivedAt
      : new Date(String(current.archivedAt));
  if (Date.now() - archivedAt.getTime() > RESTORE_MS) {
    throw new AppError(
      "VALIDATION_FAILED",
      `Restore window of ${limits.ARCHIVE_RESTORE_DAYS} days has expired.`,
    );
  }

  // Duplicate active course code check
  const siblings = await db.orm.public.Subject.where({
    semesterId: current.semesterId,
    archivedAt: null,
  }).all();
  if (siblings.some((s) => s.courseCodeNorm === current.courseCodeNorm)) {
    throw new AppError(
      "DUPLICATE_COURSE_CODE",
      "An active subject with this course code already exists in the semester.",
      { courseCodeNorm: current.courseCodeNorm },
    );
  }

  await db.orm.public.Subject.where({ id: subjectId }).update({
    archivedAt: null,
  });

  const row = await requireOwnedSubject(userId, subjectId);
  return mapSubject(row);
}
