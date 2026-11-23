import "server-only";

/**
 * Checklist write — toggles ChecklistItem (invariant I14).
 * Optional planWeekId updates only that Learning Plan row’s status.
 */

import { db } from "@/lib/db";
import { requireOwnedSubject } from "@/lib/db/ownership-guards";
import { notFound } from "@/lib/http/errors";
import { listChecklistForSubject } from "@/lib/queries/checklist";
import {
  mapChecklistItem,
  type ChecklistItemDto,
} from "@/lib/services/mappers";
import type { ToggleChecklistInput } from "@/lib/validation/checklist";

export { listChecklistForSubject };

/** Upsert one week done flag for an owned subject. */
export async function toggleChecklistWeek(
  userId: string,
  subjectId: string,
  input: ToggleChecklistInput,
): Promise<ChecklistItemDto> {
  await requireOwnedSubject(userId, subjectId);

  const existing = await db.orm.public.ChecklistItem.where({
    subjectId,
    weekNumber: input.weekNumber,
  }).first();

  let result: ChecklistItemDto;
  if (existing) {
    await db.orm.public.ChecklistItem.where({ id: existing.id }).update({
      done: input.done,
    });
    const updated = await db.orm.public.ChecklistItem.where({
      id: existing.id,
    }).first();
    if (!updated) throw notFound();
    result = mapChecklistItem(updated);
  } else {
    const created = await db.orm.public.ChecklistItem.create({
      subjectId,
      weekNumber: input.weekNumber,
      done: input.done,
    });
    result = mapChecklistItem(created);
  }

  await syncPlanWeekStatusFromChecklist(
    subjectId,
    input.weekNumber,
    input.done,
    input.planWeekId,
  );

  /* Recompute week-level done from all plan rows when a single row was toggled. */
  if (input.planWeekId) {
    await recomputeChecklistDoneForWeek(subjectId, input.weekNumber);
    const fresh = await db.orm.public.ChecklistItem.where({
      subjectId,
      weekNumber: input.weekNumber,
    }).first();
    if (fresh) result = mapChecklistItem(fresh);
  }

  return result;
}

/** Update one PlanWeek (preferred) or all rows for the week. */
async function syncPlanWeekStatusFromChecklist(
  subjectId: string,
  weekNumber: number,
  done: boolean,
  planWeekId?: string,
) {
  const nextStatus = done ? "Done" : "In progress";

  if (planWeekId) {
    const planWeek = await db.orm.public.PlanWeek.where({
      id: planWeekId,
      subjectId,
    }).first();
    if (!planWeek || planWeek.weekNumber !== weekNumber) return;
    if (planWeek.status === "No class") return;
    if (planWeek.status === nextStatus) return;
    await db.orm.public.PlanWeek.where({ id: planWeek.id }).update({
      status: nextStatus,
    });
    return;
  }

  const planWeeks = await db.orm.public.PlanWeek.where({
    subjectId,
    weekNumber,
  }).all();
  for (const planWeek of planWeeks) {
    if (planWeek.status === "No class") continue;
    if (planWeek.status === nextStatus) continue;
    await db.orm.public.PlanWeek.where({ id: planWeek.id }).update({
      status: nextStatus,
    });
  }
}

async function recomputeChecklistDoneForWeek(
  subjectId: string,
  weekNumber: number,
) {
  const planWeeks = await db.orm.public.PlanWeek.where({
    subjectId,
    weekNumber,
  }).all();
  const active = planWeeks.filter((p) => p.status !== "No class");
  const done =
    active.length > 0 && active.every((p) => p.status === "Done");
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
