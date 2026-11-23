import "server-only";

/**
 * Outcome write use-cases — replace set on owned subject (Phase 1).
 */

import { limits } from "@/lib/config/limits";
import { db } from "@/lib/db";
import { requireOwnedSubject } from "@/lib/db/ownership-guards";
import { AppError } from "@/lib/http/errors";
import { listOutcomesForSubject } from "@/lib/queries/outcomes";
import type { OutcomeDto } from "@/lib/services/mappers";
import type { ReplaceOutcomesInput } from "@/lib/validation/outcome";

export { listOutcomesForSubject };

/** Replace all outcomes for an owned subject (transactional). */
export async function replaceOutcomes(
  userId: string,
  subjectId: string,
  input: ReplaceOutcomesInput,
): Promise<OutcomeDto[]> {
  await requireOwnedSubject(userId, subjectId);

  if (input.outcomes.length > limits.MAX_OUTCOMES) {
    throw new AppError(
      "LIMIT_REACHED",
      `At most ${limits.MAX_OUTCOMES} outcomes per subject.`,
    );
  }

  await db.transaction(async (tx) => {
    const existing = await tx.orm.public.Outcome.where({ subjectId }).all();
    for (const row of existing) {
      await tx.orm.public.Outcome.where({ id: row.id }).delete();
    }
    for (const item of input.outcomes) {
      await tx.orm.public.Outcome.create({
        subjectId,
        kind: item.kind,
        code: item.code,
        description: item.description,
        position: item.position,
      });
    }
  });

  return listOutcomesForSubject(userId, subjectId);
}
