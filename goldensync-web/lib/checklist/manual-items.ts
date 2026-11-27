// WHAT: UI-friendly loaders for manual checklist items (maps DTOs ↔ local shape).
// HOW: Wraps lib/api/manual-checklist; swallows fetch errors to empty list where noted.
// SCREEN: Subject manual checklist. RISK: Low — not used for grades.

/**
 * Manual checklist items — API-backed per subject (never feeds Calculator).
 */

import {
  createManualChecklistItem as apiCreate,
  deleteManualChecklistItem as apiDelete,
  fetchManualChecklist,
  patchManualChecklistItem,
  type ManualChecklistItemDto,
} from "@/lib/api/manual-checklist";

export interface ManualChecklistItem {
  id: string;
  title: string;
  detail: string;
  done: boolean;
  createdAt: number;
  updatedAt: number;
}

function fromDto(row: ManualChecklistItemDto): ManualChecklistItem {
  return {
    id: row.id,
    title: row.title,
    detail: row.detail,
    done: row.done,
    createdAt: Date.parse(row.createdAt) || Date.now(),
    updatedAt: Date.parse(row.updatedAt) || Date.now(),
  };
}

/** Load manual checklist items for a subject. */
export async function loadManualChecklist(
  subjectId: string,
): Promise<ManualChecklistItem[]> {
  try {
    const rows = await fetchManualChecklist(subjectId);
    return rows.map(fromDto).sort((a, b) => a.createdAt - b.createdAt);
  } catch {
    return [];
  }
}

/** Add a manual item. */
export async function addManualChecklistItem(
  subjectId: string,
  input: { title: string; detail?: string },
): Promise<ManualChecklistItem[]> {
  const title = input.title.trim();
  if (!title) return loadManualChecklist(subjectId);
  await apiCreate(subjectId, {
    title,
    detail: (input.detail ?? "").trim(),
  });
  return loadManualChecklist(subjectId);
}

/** Update fields on a manual item. */
export async function updateManualChecklistItem(
  subjectId: string,
  id: string,
  patch: Partial<Pick<ManualChecklistItem, "title" | "detail" | "done">>,
): Promise<ManualChecklistItem[]> {
  await patchManualChecklistItem(subjectId, id, {
    title: patch.title?.trim(),
    detail: patch.detail?.trim(),
    done: patch.done,
  });
  return loadManualChecklist(subjectId);
}

/** Delete a manual item. */
export async function deleteManualChecklistItem(
  subjectId: string,
  id: string,
): Promise<ManualChecklistItem[]> {
  await apiDelete(subjectId, id);
  return loadManualChecklist(subjectId);
}
