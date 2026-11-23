import "server-only";

/**
 * Checklist write — toggles ChecklistItem (invariant I14).
 * Optional planWeekId updates only that Learning Plan row’s status.
 * Unchecking Done restores "Not started" (not "In progress").
 */

import { db } from "@/lib/db";
import { requireOwnedSubject } from "@/lib/db/ownership-guards";
import { listChecklistForSubject } from "@/lib/queries/checklist";
import { upsertChecklistDoneForWeek } from "@/lib/services/checklist-sync";
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

  const upserted = await upsertChecklistDoneForWeek(
    subjectId,
    input.weekNumber,
    input.done,
  );
  let result = mapChecklistItem(upserted);

  await syncPlanWeekStatusFromChecklist(
    subjectId,
    input.weekNumber,
    input.done,
    input.planWeekId,
  );

  /* Recompute week-level done from all plan rows when a single row was toggled. */
  if (input.planWeekId) {
    const done = await recomputeChecklistDoneForWeek(
      subjectId,
      input.weekNumber,
    );
    const synced = await upsertChecklistDoneForWeek(
      subjectId,
      input.weekNumber,
      done,
    );
    result = mapChecklistItem(synced);
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
  const nextStatus = done ? "Done" : "Not started";

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
): Promise<boolean> {
  const planWeeks = await db.orm.public.PlanWeek.where({
    subjectId,
    weekNumber,
  }).all();
  const active = planWeeks.filter((p) => p.status !== "No class");
  return active.length > 0 && active.every((p) => p.status === "Done");
}
