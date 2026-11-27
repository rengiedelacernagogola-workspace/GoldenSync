// WHAT: Client for plan notes — per-subject notes and Notes hub across subjects.
// SCREEN: Notes page and subject-scoped note cards. RISK: Medium — writes user content.

/**
 * Plan notes API client.
 */

import { apiFetch } from "@/lib/api/client";

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
  courseCode?: string;
  subjectTitle?: string;
  semesterEndDate?: string;
};

/** GET /api/notes — cross-subject library for the Notes hub. */
export function fetchAllPlanNotes(opts?: { includeShelved?: boolean }) {
  const q = opts?.includeShelved ? "?includeShelved=1" : "";
  return apiFetch<PlanNoteDto[]>(`/api/notes${q}`);
}

/** GET /api/subjects/:id/notes */
// WHAT: Notes for one subject; optional shelved/archived rows.
export function fetchPlanNotes(
  subjectId: string,
  opts?: { includeShelved?: boolean; includeArchived?: boolean },
) {
  const shelved = opts?.includeShelved || opts?.includeArchived;
  const q = shelved ? "?includeShelved=1" : "";
  return apiFetch<PlanNoteDto[]>(`/api/subjects/${subjectId}/notes${q}`);
}

/** POST /api/subjects/:id/notes */
export function createPlanNote(
  subjectId: string,
  body: {
    title: string;
    topic?: string;
    body: string;
    importance?: number;
    pinned?: boolean;
  },
) {
  return apiFetch<PlanNoteDto>(`/api/subjects/${subjectId}/notes`, {
    method: "POST",
    body,
  });
}

/** PATCH /api/subjects/:id/notes/:noteId */
export function patchPlanNote(
  subjectId: string,
  noteId: string,
  body: {
    title?: string;
    topic?: string;
    body?: string;
    importance?: number;
    pinned?: boolean;
    archived?: boolean;
    deleted?: boolean;
  },
) {
  return apiFetch<PlanNoteDto>(
    `/api/subjects/${subjectId}/notes/${noteId}`,
    { method: "PATCH", body },
  );
}

/** DELETE /api/subjects/:id/notes/:noteId — soft-delete (30-day trash). */
export function deletePlanNote(subjectId: string, noteId: string) {
  return apiFetch<{ ok: boolean }>(
    `/api/subjects/${subjectId}/notes/${noteId}`,
    { method: "DELETE" },
  );
}

/** Restore archived or soft-deleted note. */
export function restorePlanNote(subjectId: string, noteId: string) {
  return patchPlanNote(subjectId, noteId, {
    archived: false,
    deleted: false,
  });
}
