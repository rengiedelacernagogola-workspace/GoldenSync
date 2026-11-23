/**
 * Saved plan notes — API-backed (Neon / local Postgres).
 */

import {
  createPlanNote,
  deletePlanNote,
  fetchPlanNotes,
  patchPlanNote,
  restorePlanNote,
  type PlanNoteDto,
} from "@/lib/api/notes";

export interface SavedPlanNote {
  id: string;
  weekNumber: number;
  title: string;
  topic: string;
  body: string;
  savedAt: number;
  archived?: boolean;
  deleted?: boolean;
  archivedAt?: string | null;
  deletedAt?: string | null;
  importance?: number;
  pinned?: boolean;
  subjectId?: string;
  subjectCode?: string;
}

function fromDto(n: PlanNoteDto): SavedPlanNote {
  return {
    id: n.id,
    weekNumber: 13,
    title: n.title,
    topic: n.topic,
    body: n.body,
    savedAt: Date.parse(n.savedAt) || Date.now(),
    archived: n.archivedAt != null,
    deleted: n.deletedAt != null,
    archivedAt: n.archivedAt,
    deletedAt: n.deletedAt,
    importance: n.importance,
    pinned: n.pinned,
    subjectId: n.subjectId,
    subjectCode: n.courseCode,
  };
}

/** Load saved note entries for a subject (includes shelved when requested). */
export async function loadSavedNotes(
  subjectId: string,
): Promise<SavedPlanNote[]> {
  try {
    const rows = await fetchPlanNotes(subjectId, { includeShelved: true });
    return rows.map(fromDto);
  } catch {
    return [];
  }
}

/** Append one note; returns the new list. */
export async function appendSavedNote(
  subjectId: string,
  note: Omit<
    SavedPlanNote,
    | "id"
    | "savedAt"
    | "archived"
    | "deleted"
    | "archivedAt"
    | "deletedAt"
    | "subjectId"
    | "subjectCode"
  >,
): Promise<SavedPlanNote[]> {
  await createPlanNote(subjectId, {
    title: note.title,
    topic: note.topic,
    body: note.body,
  });
  return loadSavedNotes(subjectId);
}

/** Soft-delete the most recently saved active note. */
export async function popLastSavedNote(subjectId: string): Promise<{
  notes: SavedPlanNote[];
  removed: SavedPlanNote | null;
}> {
  const current = await loadSavedNotes(subjectId);
  let removeAt = -1;
  for (let i = current.length - 1; i >= 0; i -= 1) {
    if (!current[i]?.archived && !current[i]?.deleted) {
      removeAt = i;
      break;
    }
  }
  if (removeAt < 0) return { notes: current, removed: null };
  const removed = current[removeAt] ?? null;
  if (removed) {
    await deletePlanNote(subjectId, removed.id);
  }
  return { notes: await loadSavedNotes(subjectId), removed };
}

/** Soft-delete a note by id (30-day trash). */
export async function deleteSavedNote(
  subjectId: string,
  id: string,
): Promise<SavedPlanNote[]> {
  await deletePlanNote(subjectId, id);
  return loadSavedNotes(subjectId);
}

/** Mark a note archived. */
export async function archiveSavedNote(
  subjectId: string,
  id: string,
): Promise<SavedPlanNote[]> {
  await patchPlanNote(subjectId, id, { archived: true });
  return loadSavedNotes(subjectId);
}

/** Restore archived or soft-deleted note. */
export async function restoreSavedNote(
  subjectId: string,
  id: string,
): Promise<SavedPlanNote[]> {
  await restorePlanNote(subjectId, id);
  return loadSavedNotes(subjectId);
}

/** Replace fields on an existing note. */
export async function updateSavedNote(
  subjectId: string,
  id: string,
  patch: Partial<
    Pick<SavedPlanNote, "title" | "topic" | "body" | "importance" | "pinned">
  >,
): Promise<SavedPlanNote[]> {
  await patchPlanNote(subjectId, id, {
    title: patch.title,
    topic: patch.topic,
    body: patch.body,
    importance: patch.importance,
    pinned: patch.pinned,
  });
  return loadSavedNotes(subjectId);
}
