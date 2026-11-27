import "server-only";

// WHAT: Dedupe checklist rows and align done flags with plan week status.
// HOW: Internal helpers called from plan/checklist writes — not API surface.
// EDIT: Dedup strategy if legacy data has many duplicates.
// KEEP: One row per (subjectId, weekNumber) target invariant.
// RISK: High — database maintenance queries.

/**
 * ChecklistItem helpers — keep at most one row per (subjectId, weekNumber)
 * and sync done state even if legacy duplicates exist.
 */

import { db } from "@/lib/db";

export type ChecklistRow = {
  id: string;
  subjectId: string;
  weekNumber: number;
  done: boolean;
};

/**
 * Upsert week-level done flag. Updates the canonical row, deletes duplicates,
 * and creates a row when none exist.
 */
export async function upsertChecklistDoneForWeek(
  subjectId: string,
  weekNumber: number,
  done: boolean,
): Promise<ChecklistRow> {
  const rows = await db.orm.public.ChecklistItem.where({
    subjectId,
    weekNumber,
  }).all();

  if (rows.length === 0) {
    const created = await db.orm.public.ChecklistItem.create({
      subjectId,
      weekNumber,
      done,
    });
    return {
      id: created.id,
      subjectId: created.subjectId,
      weekNumber: created.weekNumber,
      done: created.done,
    };
  }

  const [primary, ...dupes] = rows;
  if (!primary) {
    const created = await db.orm.public.ChecklistItem.create({
      subjectId,
      weekNumber,
      done,
    });
    return {
      id: created.id,
      subjectId: created.subjectId,
      weekNumber: created.weekNumber,
      done: created.done,
    };
  }

  if (primary.done !== done) {
    await db.orm.public.ChecklistItem.where({ id: primary.id }).update({
      done,
    });
  }

  for (const dupe of dupes) {
    await db.orm.public.ChecklistItem.where({ id: dupe.id }).delete();
  }

  return {
    id: primary.id,
    subjectId: primary.subjectId,
    weekNumber: primary.weekNumber,
    done,
  };
}

/**
 * Sync done from plan statuses. Creates only when done; otherwise updates /
 * clears duplicates without inventing a false-done row from plan replace.
 */
export async function syncChecklistDoneFromPlan(
  subjectId: string,
  weekNumber: number,
  done: boolean,
): Promise<ChecklistRow | null> {
  const rows = await db.orm.public.ChecklistItem.where({
    subjectId,
    weekNumber,
  }).all();

  if (rows.length === 0) {
    if (!done) return null;
    const created = await db.orm.public.ChecklistItem.create({
      subjectId,
      weekNumber,
      done: true,
    });
    return {
      id: created.id,
      subjectId: created.subjectId,
      weekNumber: created.weekNumber,
      done: true,
    };
  }

  const [primary, ...dupes] = rows;
  if (!primary) return null;

  if (primary.done !== done) {
    await db.orm.public.ChecklistItem.where({ id: primary.id }).update({
      done,
    });
  }

  for (const dupe of dupes) {
    await db.orm.public.ChecklistItem.where({ id: dupe.id }).delete();
  }

  return {
    id: primary.id,
    subjectId: primary.subjectId,
    weekNumber: primary.weekNumber,
    done,
  };
}
