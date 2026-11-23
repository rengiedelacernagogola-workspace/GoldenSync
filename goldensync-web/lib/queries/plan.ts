import "server-only";

/**
 * Plan week reads — scoped by subject owner.
 */

import { db } from "@/lib/db";
import { requireOwnedSubject } from "@/lib/db/ownership-guards";
import { mapPlanWeek, type PlanWeekDto } from "@/lib/services/mappers";

/** List plan weeks for an owned subject (by weekNumber). */
export async function listPlanWeeksForSubject(
  userId: string,
  subjectId: string,
): Promise<PlanWeekDto[]> {
  await requireOwnedSubject(userId, subjectId);

  const rows = await db.orm.public.PlanWeek.where({ subjectId }).all();
  return rows.map(mapPlanWeek).sort((a, b) => {
    if (a.weekNumber !== b.weekNumber) return a.weekNumber - b.weekNumber;
    return a.position - b.position;
  });
}
