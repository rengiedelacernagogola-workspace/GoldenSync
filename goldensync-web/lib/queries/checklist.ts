import "server-only";

/**
 * Checklist reads — scoped by subject owner.
 */

import { db } from "@/lib/db";
import { requireOwnedSubject } from "@/lib/db/ownership-guards";
import {
  mapChecklistItem,
  type ChecklistItemDto,
} from "@/lib/services/mappers";

/** List checklist items for an owned subject. */
export async function listChecklistForSubject(
  userId: string,
  subjectId: string,
): Promise<ChecklistItemDto[]> {
  await requireOwnedSubject(userId, subjectId);

  const rows = await db.orm.public.ChecklistItem.where({ subjectId }).all();
  return rows.map(mapChecklistItem).sort((a, b) => a.weekNumber - b.weekNumber);
}
