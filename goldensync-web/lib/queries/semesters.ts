import "server-only";

// WHAT: List/load semesters for the current user (read path).
// HOW: db queries filtered by userId + mapSemester DTOs.
// SCREEN: Semester picker, layout bootstrap.
// EDIT: Sort order for list queries.
// KEEP: Never query semesters without userId filter.
// RISK: High — database + auth scoping.

/**
 * Semester reads for Server Components / services (architecture §4).
 */

import { db } from "@/lib/db";
import { mapSemester, type SemesterDto } from "@/lib/services/mappers";
import { notFound } from "@/lib/http/errors";

/** List all semesters owned by userId (newest first). */
export async function listSemestersForUser(userId: string): Promise<SemesterDto[]> {
  const rows = await db.orm.public.Semester.where({ userId }).all();
  return rows
    .map(mapSemester)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

/** Get one owned semester or 404. */
export async function getSemesterForUser(
  userId: string,
  semesterId: string,
): Promise<SemesterDto> {
  const row = await db.orm.public.Semester.where({
    id: semesterId,
    userId,
  }).first();
  if (!row) throw notFound();
  return mapSemester(row);
}
