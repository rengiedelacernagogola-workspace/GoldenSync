import "server-only";

/**
 * Plan week write use-cases — replace set on owned subject.
 * Duplicate weekNumbers allowed (multiple topics per week).
 * ChecklistItem.done for a week = all non–No-class rows for that week are Done.
 *
 * Avoid long Neon transactions (rollback failures under pooler / cold start).
 */

import { limits } from "@/lib/config/limits";
import { db } from "@/lib/db";
import { requireOwnedSubject } from "@/lib/db/ownership-guards";
import { AppError } from "@/lib/http/errors";
import { listPlanWeeksForSubject } from "@/lib/queries/plan";
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

  const existing = await db.orm.public.PlanWeek.where({ subjectId }).all();
  for (const row of existing) {
    await db.orm.public.PlanWeek.where({ id: row.id }).delete();
  }

  const byWeek = new Map<number, string[]>();

  for (let index = 0; index < input.weeks.length; index++) {
    const week = input.weeks[index]!;
    const status = week.status ?? "Not started";
    const position = week.position ?? index;
    const list = byWeek.get(week.weekNumber) ?? [];
    list.push(status);
    byWeek.set(week.weekNumber, list);

    await db.orm.public.PlanWeek.create({
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

  for (const [weekNumber, statuses] of byWeek) {
    const active = statuses.filter((s) => s !== "No class");
    const done = active.length > 0 && active.every((s) => s === "Done");
    const checklist = await db.orm.public.ChecklistItem.where({
      subjectId,
      weekNumber,
    }).first();
    if (checklist) {
      await db.orm.public.ChecklistItem.where({ id: checklist.id }).update({
        done,
      });
    } else if (done) {
      await db.orm.public.ChecklistItem.create({
        subjectId,
        weekNumber,
        done: true,
      });
    }
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
