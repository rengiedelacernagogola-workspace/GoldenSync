import "server-only";

/**
 * Manual checklist — freeform items; never feeds Calculator (I14).
 */

import { db } from "@/lib/db";
import { requireOwnedSubject } from "@/lib/db/ownership-guards";
import { notFound } from "@/lib/http/errors";
import type {
  CreateManualChecklistInput,
  UpdateManualChecklistInput,
} from "@/lib/validation/manual-checklist";

export type ManualChecklistItemDto = {
  id: string;
  subjectId: string;
  title: string;
  detail: string;
  done: boolean;
  position: number;
  createdAt: string;
  updatedAt: string;
};

function toIso(value: unknown): string {
  if (value instanceof Date) return value.toISOString();
  if (typeof value === "string") return value;
  return String(value);
}

function mapItem(row: {
  id: string;
  subjectId: string;
  title: string;
  detail: string;
  done: boolean;
  position: number;
  createdAt: unknown;
  updatedAt: unknown;
}): ManualChecklistItemDto {
  return {
    id: row.id,
    subjectId: row.subjectId,
    title: row.title,
    detail: row.detail,
    done: row.done,
    position: row.position,
    createdAt: toIso(row.createdAt),
    updatedAt: toIso(row.updatedAt),
  };
}

/** List manual checklist items ordered by position then createdAt. */
export async function listManualChecklist(
  userId: string,
  subjectId: string,
): Promise<ManualChecklistItemDto[]> {
  await requireOwnedSubject(userId, subjectId);
  const rows = await db.orm.public.ManualChecklistItem.where({
    subjectId,
  }).all();
  return rows
    .map(mapItem)
    .sort((a, b) =>
      a.position !== b.position
        ? a.position - b.position
        : a.createdAt.localeCompare(b.createdAt),
    );
}

/** Add a manual checklist item. */
export async function createManualChecklistItem(
  userId: string,
  subjectId: string,
  input: CreateManualChecklistInput,
): Promise<ManualChecklistItemDto> {
  await requireOwnedSubject(userId, subjectId);
  const existing = await db.orm.public.ManualChecklistItem.where({
    subjectId,
  }).all();
  const position =
    existing.length === 0
      ? 0
      : Math.max(...existing.map((r) => r.position)) + 1;

  const created = await db.orm.public.ManualChecklistItem.create({
    subjectId,
    title: input.title,
    detail: input.detail ?? "",
    done: false,
    position,
  });
  return mapItem(created);
}

/** Update a manual checklist item. */
export async function updateManualChecklistItem(
  userId: string,
  subjectId: string,
  itemId: string,
  input: UpdateManualChecklistInput,
): Promise<ManualChecklistItemDto> {
  await requireOwnedSubject(userId, subjectId);
  const existing = await db.orm.public.ManualChecklistItem.where({
    id: itemId,
    subjectId,
  }).first();
  if (!existing) throw notFound();

  const patch: Record<string, unknown> = {};
  if (input.title !== undefined) patch.title = input.title;
  if (input.detail !== undefined) patch.detail = input.detail;
  if (input.done !== undefined) patch.done = input.done;
  if (input.position !== undefined) patch.position = input.position;

  await db.orm.public.ManualChecklistItem.where({ id: itemId }).update(patch);
  const updated = await db.orm.public.ManualChecklistItem.where({
    id: itemId,
  }).first();
  if (!updated) throw notFound();
  return mapItem(updated);
}

/** Delete a manual checklist item. */
export async function deleteManualChecklistItem(
  userId: string,
  subjectId: string,
  itemId: string,
): Promise<void> {
  await requireOwnedSubject(userId, subjectId);
  const existing = await db.orm.public.ManualChecklistItem.where({
    id: itemId,
    subjectId,
  }).first();
  if (!existing) throw notFound();
  await db.orm.public.ManualChecklistItem.where({ id: itemId }).delete();
}
