import "server-only";

// WHAT: Replace all plan week rows for a subject (learning plan editor).
// HOW: Full replace transaction after requireOwnedSubject.
// SCREEN: Learning plan table on subject.
// EDIT: Duplicate weekNumbers allowed — don’t dedupe in service without product OK.
// KEEP: Checklist sync may run after replace (check callers).
// RISK: High — database bulk write.

/**
 * Plan week write use-cases — replace set on owned subject.
 * Duplicate weekNumbers allowed (multiple topics per week).
 * ChecklistItem.done for a week = all non–No-class rows for that week are Done.
 */

import { limits } from "@/lib/config/limits";
import { db } from "@/lib/db";
import { requireOwnedSubject } from "@/lib/db/ownership-guards";
import { AppError } from "@/lib/http/errors";
import { listPlanWeeksForSubject } from "@/lib/queries/plan";
import { syncChecklistDoneFromPlan } from "@/lib/services/checklist-sync";
import type { PlanWeekDto } from "@/lib/services/mappers";
import type { ReplacePlanInput } from "@/lib/validation/plan";

export { listPlanWeeksForSubject };

/** Replace all plan weeks for an owned subject. */
export async function replacePlanWeeks(
  userId: string,
  subjectId: string,
  input: ReplacePlanInput,
): Promise<PlanWeekDto[]> {
  await requireOwnedSubject(userId, subjectId);

  if (input.weeks.length > limits.MAX_PLAN_ENTRIES) {
    throw new AppError(
      "LIMIT_REACHED",
      `At most ${limits.MAX_PLAN_ENTRIES} plan rows per subject.`,
    );
  }

  const byWeek = new Map<number, string[]>();

  await db.transaction(async (tx) => {
    const existing = await tx.orm.public.PlanWeek.where({ subjectId }).all();
    for (const row of existing) {
      await tx.orm.public.PlanWeek.where({ id: row.id }).delete();
    }

    for (let index = 0; index < input.weeks.length; index++) {
      const week = input.weeks[index]!;
      const status = week.status ?? "Not started";
      const position = week.position ?? index;
      const list = byWeek.get(week.weekNumber) ?? [];
      list.push(status);
      byWeek.set(week.weekNumber, list);

      await tx.orm.public.PlanWeek.create({
        subjectId,
        weekNumber: week.weekNumber,
        position,
        topic: week.topic ?? null,
        outcome: week.outcome ?? null,
        activities: week.activities ?? null,
        status,
        notes: week.notes ?? null,
      });
    }
  });

  for (const [weekNumber, statuses] of byWeek) {
    const active = statuses.filter((s) => s !== "No class");
    const done = active.length > 0 && active.every((s) => s === "Done");
    await syncChecklistDoneFromPlan(subjectId, weekNumber, done);
  }

  const keep = new Set(byWeek.keys());
  const checklistRows = await db.orm.public.ChecklistItem.where({
    subjectId,
  }).all();
  for (const row of checklistRows) {
    if (!keep.has(row.weekNumber)) {
      await db.orm.public.ChecklistItem.where({ id: row.id }).delete();
    }
  }

  return listPlanWeeksForSubject(userId, subjectId);
}
