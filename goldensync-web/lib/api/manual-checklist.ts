// WHAT: HTTP client for per-subject manual checklist rows (study todos, not graded work).
// HOW: Thin wrappers around apiFetch for /api/subjects/:id/manual-checklist routes.
// SCREEN: Subject checklist tab. RISK: Low — user-owned list data only.

/**
 * Manual checklist API client (I14 — never feeds grades).
 */

import { apiFetch } from "@/lib/api/client";

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

/** GET /api/subjects/:id/manual-checklist */
export function fetchManualChecklist(subjectId: string) {
  return apiFetch<ManualChecklistItemDto[]>(
    `/api/subjects/${subjectId}/manual-checklist`,
  );
}

/** POST /api/subjects/:id/manual-checklist */
export function createManualChecklistItem(
  subjectId: string,
  body: { title: string; detail?: string },
) {
  return apiFetch<ManualChecklistItemDto>(
    `/api/subjects/${subjectId}/manual-checklist`,
    { method: "POST", body },
  );
}

/** PATCH /api/subjects/:id/manual-checklist/:itemId */
export function patchManualChecklistItem(
  subjectId: string,
  itemId: string,
  body: {
    title?: string;
    detail?: string;
    done?: boolean;
    position?: number;
  },
) {
  return apiFetch<ManualChecklistItemDto>(
    `/api/subjects/${subjectId}/manual-checklist/${itemId}`,
    { method: "PATCH", body },
  );
}

/** DELETE /api/subjects/:id/manual-checklist/:itemId */
export function deleteManualChecklistItem(
  subjectId: string,
  itemId: string,
) {
  return apiFetch<{ ok: boolean }>(
    `/api/subjects/${subjectId}/manual-checklist/${itemId}`,
    { method: "DELETE" },
  );
}
