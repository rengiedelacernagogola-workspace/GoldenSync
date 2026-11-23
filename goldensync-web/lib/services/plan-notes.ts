import "server-only";

/**
 * Plan notes — multi-entry library per subject (replaces localStorage gs-notes-*).
 * Pin ≤3 enforced in service (DBDEC-006).
 * Soft-delete via deletedAt; purge after NOTE_SOFT_DELETE_DAYS.
 */

import { limits } from "@/lib/config/limits";
import { db } from "@/lib/db";
import { requireOwnedSubject } from "@/lib/db/ownership-guards";
import { AppError, notFound } from "@/lib/http/errors";
import type {
  CreatePlanNoteInput,
  UpdatePlanNoteInput,
} from "@/lib/validation/plan-note";

export type PlanNoteDto = {
  id: string;
  subjectId: string;
  title: string;
  topic: string;
  body: string;
  importance: number;
  pinned: boolean;
  archivedAt: string | null;
  deletedAt: string | null;
  savedAt: string;
  createdAt: string;
  /** Present on cross-subject list. */
  courseCode?: string;
  subjectTitle?: string;
};

function toIso(value: unknown): string {
  if (value instanceof Date) return value.toISOString();
  if (typeof value === "string") return value;
  return String(value);
}

function mapPlanNote(row: {
  id: string;
  subjectId: string;
  title: string;
  topic: string;
  body: string;
  importance: number;
  pinned: boolean;
  archivedAt: unknown;
  deletedAt?: unknown;
  savedAt: unknown;
  createdAt: unknown;
}): PlanNoteDto {
  return {
    id: row.id,
    subjectId: row.subjectId,
    title: row.title,
    topic: row.topic,
    body: row.body,
    importance: row.importance,
    pinned: row.pinned,
    archivedAt: row.archivedAt ? toIso(row.archivedAt) : null,
    deletedAt: row.deletedAt ? toIso(row.deletedAt) : null,
    savedAt: toIso(row.savedAt),
    createdAt: toIso(row.createdAt),
  };
}

function isActive(row: { archivedAt: unknown; deletedAt?: unknown }) {
  return row.archivedAt == null && row.deletedAt == null;
}

/** List notes for an owned subject (newest savedAt first). */
export async function listPlanNotes(
  userId: string,
  subjectId: string,
  opts?: { includeShelved?: boolean },
): Promise<PlanNoteDto[]> {
  await requireOwnedSubject(userId, subjectId);
  const rows = await db.orm.public.PlanNote.where({ subjectId }).all();
  const filtered = opts?.includeShelved
    ? rows
    : rows.filter((r) => isActive(r));
  return filtered
    .map(mapPlanNote)
    .sort((a, b) => (a.savedAt < b.savedAt ? 1 : -1));
}

/**
 * All notes across the user's subjects (global Notes hub).
 * includeShelved → active + archived + soft-deleted (not yet purged).
 */
export async function listAllPlanNotesForUser(
  userId: string,
  opts?: { includeShelved?: boolean },
): Promise<PlanNoteDto[]> {
  const semesters = await db.orm.public.Semester.where({ userId }).all();
  const out: PlanNoteDto[] = [];

  for (const semester of semesters) {
    const subjects = await db.orm.public.Subject.where({
      semesterId: semester.id,
      archivedAt: null,
    }).all();
    for (const subject of subjects) {
      const rows = await db.orm.public.PlanNote.where({
        subjectId: subject.id,
      }).all();
      for (const row of rows) {
        if (!opts?.includeShelved && !isActive(row)) continue;
        out.push({
          ...mapPlanNote(row),
          courseCode: subject.courseCode,
          subjectTitle: subject.title,
        });
      }
    }
  }

  return out.sort((a, b) => (a.savedAt < b.savedAt ? 1 : -1));
}

/** Create a plan note. */
export async function createPlanNote(
  userId: string,
  subjectId: string,
  input: CreatePlanNoteInput,
): Promise<PlanNoteDto> {
  await requireOwnedSubject(userId, subjectId);

  const pinned = input.pinned === true;
  if (pinned) {
    const pinnedCount = (
      await db.orm.public.PlanNote.where({ subjectId }).all()
    ).filter((r) => r.pinned && isActive(r)).length;
    if (pinnedCount >= 3) {
      throw new AppError(
        "LIMIT_REACHED",
        "At most 3 pinned notes per subject.",
      );
    }
  }

  const created = await db.orm.public.PlanNote.create({
    subjectId,
    title: input.title,
    topic: input.topic ?? "",
    body: input.body,
    importance: input.importance ?? 1,
    pinned,
  });
  return mapPlanNote(created);
}

/** Update a plan note (ownership via subject). */
export async function updatePlanNote(
  userId: string,
  subjectId: string,
  noteId: string,
  input: UpdatePlanNoteInput,
): Promise<PlanNoteDto> {
  await requireOwnedSubject(userId, subjectId);

  const existing = await db.orm.public.PlanNote.where({
    id: noteId,
    subjectId,
  }).first();
  if (!existing) throw notFound();

  if (input.pinned === true && !existing.pinned) {
    const pinnedCount = (
      await db.orm.public.PlanNote.where({ subjectId }).all()
    ).filter((r) => r.pinned && isActive(r) && r.id !== noteId).length;
    if (pinnedCount >= 3) {
      throw new AppError(
        "LIMIT_REACHED",
        "At most 3 pinned notes per subject.",
      );
    }
  }

  const patch: Record<string, unknown> = {
    savedAt: new Date(),
  };
  if (input.title !== undefined) patch.title = input.title;
  if (input.topic !== undefined) patch.topic = input.topic;
  if (input.body !== undefined) patch.body = input.body;
  if (input.importance !== undefined) patch.importance = input.importance;
  if (input.pinned !== undefined) patch.pinned = input.pinned;
  if (input.archived === true) {
    patch.archivedAt = new Date();
    patch.pinned = false;
  }
  if (input.archived === false) patch.archivedAt = null;
  if (input.deleted === true) {
    patch.deletedAt = new Date();
    patch.pinned = false;
    patch.archivedAt = null;
  }
  if (input.deleted === false) patch.deletedAt = null;

  await db.orm.public.PlanNote.where({ id: noteId }).update(patch);
  const updated = await db.orm.public.PlanNote.where({ id: noteId }).first();
  if (!updated) throw notFound();
  return mapPlanNote(updated);
}

/** Soft-delete a plan note (retained NOTE_SOFT_DELETE_DAYS before purge). */
export async function deletePlanNote(
  userId: string,
  subjectId: string,
  noteId: string,
): Promise<void> {
  await requireOwnedSubject(userId, subjectId);
  const existing = await db.orm.public.PlanNote.where({
    id: noteId,
    subjectId,
  }).first();
  if (!existing) throw notFound();
  await db.orm.public.PlanNote.where({ id: noteId }).update({
    deletedAt: new Date(),
    pinned: false,
    archivedAt: null,
    savedAt: new Date(),
  });
}

/** Restore an archived or soft-deleted note to the active library. */
export async function restorePlanNote(
  userId: string,
  subjectId: string,
  noteId: string,
): Promise<PlanNoteDto> {
  await requireOwnedSubject(userId, subjectId);
  const existing = await db.orm.public.PlanNote.where({
    id: noteId,
    subjectId,
  }).first();
  if (!existing) throw notFound();
  await db.orm.public.PlanNote.where({ id: noteId }).update({
    archivedAt: null,
    deletedAt: null,
    savedAt: new Date(),
  });
  const updated = await db.orm.public.PlanNote.where({ id: noteId }).first();
  if (!updated) throw notFound();
  return mapPlanNote(updated);
}

/** Hard-delete soft-deleted notes older than NOTE_SOFT_DELETE_DAYS. */
export async function purgeSoftDeletedPlanNotes(
  maxAgeDays: number = limits.NOTE_SOFT_DELETE_DAYS,
): Promise<number> {
  const cutoff = new Date(Date.now() - maxAgeDays * 24 * 60 * 60 * 1000);
  const rows = await db.orm.public.PlanNote.where({}).all();
  let deleted = 0;
  for (const row of rows) {
    if (!row.deletedAt) continue;
    const when =
      row.deletedAt instanceof Date
        ? row.deletedAt
        : new Date(String(row.deletedAt));
    if (when < cutoff) {
      await db.orm.public.PlanNote.where({ id: row.id }).delete();
      deleted += 1;
    }
  }
  return deleted;
}
