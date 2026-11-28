import "server-only";

// WHAT: Saved notes library per subject (pin, archive, soft-delete).
// HOW: requireOwnedSubject; enforces pin cap and retention purge.
// SCREEN: /notes and subject notes panels.
// EDIT: NOTE_SOFT_DELETE_DAYS and max pins in limits.
// KEEP: Past semesters → read-only enforced in service.
// RISK: High — database + ownership.

/**
 * Plan notes — multi-entry library per subject (replaces localStorage gs-notes-*).
 * Pin ≤3 enforced in service (DBDEC-006).
 * Soft-delete via deletedAt; purge after NOTE_SOFT_DELETE_DAYS.
 */

import { and } from "@prisma/orm-postgres/orm-client";

import { limits } from "@/lib/config/limits";
import { isSemesterPast } from "@/lib/domain/semester-year";
import { db } from "@/lib/db";
import { requireOwnedSubject } from "@/lib/db/ownership-guards";
import { AppError, notFound } from "@/lib/http/errors";
import type {
  CreatePlanNoteInput,
  UpdatePlanNoteInput,
} from "@/lib/validation/plan-note";

async function requireEditableSubject(userId: string, subjectId: string) {
  const subject = await requireOwnedSubject(userId, subjectId);
  const semester = await db.orm.public.Semester.where({
    id: subject.semesterId,
    userId,
  }).first();
  if (!semester) throw notFound();
  if (isSemesterPast(semester.endDate)) {
    throw new AppError(
      "VALIDATION_FAILED",
      "Past semesters are view-only. Notes cannot be changed.",
    );
  }
  return subject;
}

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
  /** Semester end date for the note’s subject (ISO). */
  semesterEndDate?: string;
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

/**
 * WHAT: Lists notes for one subject, newest saved first.
 * HOW: Ownership check → SQL filter by subjectId; if not shelved, also archivedAt/deletedAt null → orderBy savedAt.
 * SCREEN: Subject notes panel / library for that course.
 * EDIT: Pass includeShelved true to also show archive and trash.
 * RISK: High
 */
/** List notes for an owned subject (newest savedAt first). */
export async function listPlanNotes(
  userId: string,
  subjectId: string,
  opts?: { includeShelved?: boolean },
): Promise<PlanNoteDto[]> {
  await requireOwnedSubject(userId, subjectId);
  const rows = opts?.includeShelved
    ? await db.orm.public.PlanNote.where({ subjectId })
        .orderBy((n) => n.savedAt.desc())
        .all()
    : await db.orm.public.PlanNote.where({ subjectId })
        .where((n) => n.archivedAt.isNull()) // still in the active library
        .where((n) => n.deletedAt.isNull())
        .orderBy((n) => n.savedAt.desc())
        .all();
  return rows.map(mapPlanNote);
}

/**
 * WHAT: Global Notes hub — all notes on this user’s non-archived subjects in fewer DB round-trips.
 * HOW: Load semesters for user → include active subjects → include planNotes (optionally only active) → flatten + sort in memory.
 * SCREEN: /notes page across courses.
 * EDIT: includeShelved true adds archived + soft-deleted (not yet hard-purged).
 * KEEP: Skip archived subjects (archivedAt null filter on Subject).
 * RISK: High
 *
 * All notes across the user's subjects (global Notes hub).
 * includeShelved → active + archived + soft-deleted (not yet purged).
 */
export async function listAllPlanNotesForUser(
  userId: string,
  opts?: { includeShelved?: boolean },
): Promise<PlanNoteDto[]> {
  const semesters = await db.orm.public.Semester.where({ userId })
    .include("subjects", (subjects) =>
      subjects
        .where((s) => s.archivedAt.isNull())
        .include("planNotes", (notes) =>
          opts?.includeShelved
            ? notes.orderBy((n) => n.savedAt.desc())
            : notes
                .where((n) =>
                  and(n.archivedAt.isNull(), n.deletedAt.isNull()),
                )
                .orderBy((n) => n.savedAt.desc()),
        ),
    )
    .all();

  const out: PlanNoteDto[] = [];
  for (const semester of semesters) {
    for (const subject of semester.subjects ?? []) {
      for (const row of subject.planNotes ?? []) {
        out.push({
          ...mapPlanNote(row),
          courseCode: subject.courseCode,
          subjectTitle: subject.title,
          semesterEndDate: toIso(semester.endDate),
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
  await requireEditableSubject(userId, subjectId);

  const pinned = input.pinned === true;
  if (pinned) {
    const pinnedRows = await db.orm.public.PlanNote.where({ subjectId })
      .where((n) => n.pinned.eq(true))
      .where((n) => n.archivedAt.isNull())
      .where((n) => n.deletedAt.isNull())
      .select("id")
      .all();
    if (pinnedRows.length >= 3) {
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
  await requireEditableSubject(userId, subjectId);

  const existing = await db.orm.public.PlanNote.where({
    id: noteId,
    subjectId,
  }).first();
  if (!existing) throw notFound();

  if (input.pinned === true && !existing.pinned) {
    const pinnedRows = await db.orm.public.PlanNote.where({ subjectId })
      .where((n) => n.pinned.eq(true))
      .where((n) => n.archivedAt.isNull())
      .where((n) => n.deletedAt.isNull())
      .where((n) => n.id.neq(noteId))
      .select("id")
      .all();
    if (pinnedRows.length >= 3) {
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
  await requireEditableSubject(userId, subjectId);
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
  await requireEditableSubject(userId, subjectId);
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

/**
 * WHAT: Cron — permanently deletes notes that sat in trash longer than NOTE_SOFT_DELETE_DAYS.
 * HOW: One deleteAndCount where deletedAt is set and older than cutoff (uses PlanNote deletedAt index).
 * SCREEN: Those notes leave Trash forever; active library is untouched.
 * EDIT: Days come from limits.NOTE_SOFT_DELETE_DAYS.
 * KEEP: Cron-only; do not call from a random user route.
 * RISK: High — ask a developer before changing cutoffs.
 */
/** Hard-delete soft-deleted notes older than NOTE_SOFT_DELETE_DAYS. */
export async function purgeSoftDeletedPlanNotes(
  maxAgeDays: number = limits.NOTE_SOFT_DELETE_DAYS,
): Promise<number> {
  const cutoff = new Date(Date.now() - maxAgeDays * 24 * 60 * 60 * 1000);
  return await db.orm.public.PlanNote.where((n) => n.deletedAt.isNotNull())
    .where((n) => n.deletedAt.lt(cutoff))
    .deleteAndCount();
}
