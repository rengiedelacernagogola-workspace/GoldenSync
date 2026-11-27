import "server-only";

// WHAT: List outcomes (PEO/PO/CO) for an owned subject.
// HOW: requireOwnedSubject + Outcome query.
// SCREEN: Outcomes panels and grade engine inputs.
// EDIT: Sort by kind/code.
// KEEP: Pairs with services/outcomes writes.
// RISK: High — database + ownership.

/**
 * Outcome reads — scoped by subject owner.
 */

import { db } from "@/lib/db";
import { requireOwnedSubject } from "@/lib/db/ownership-guards";
import { mapOutcome, type OutcomeDto } from "@/lib/services/mappers";

/** List outcomes for an owned subject (by position). */
export async function listOutcomesForSubject(
  userId: string,
  subjectId: string,
): Promise<OutcomeDto[]> {
  await requireOwnedSubject(userId, subjectId);

  const rows = await db.orm.public.Outcome.where({ subjectId }).all();
  return rows
    .map(mapOutcome)
    .sort((a, b) => a.position - b.position || a.code.localeCompare(b.code));
}
