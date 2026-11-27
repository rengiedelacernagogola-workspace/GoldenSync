/**
 * Subject API client — detail, archive, delete, export.
 */

import { apiFetch } from "@/lib/api/client";
import { type SubjectDto } from "@/lib/api/semesters";
import {
  cloneGradingTemplate,
  DEFAULT_GRADING_TEMPLATE,
  serializeGradingTemplate,
  tryParseGradingTemplate,
  type GradingTemplateDoc,
} from "@/lib/domain/grading-template";

export type { SubjectDto };

export type OutcomeDto = {
  id: string;
  subjectId: string;
  kind: "PEO" | "PO" | "CO";
  code: string;
  description: string;
  position: number;
};

export type PlanWeekDto = {
  id: string;
  subjectId: string;
  weekNumber: number;
  position: number;
  topic: string | null;
  outcome: string | null;
  activities: string | null;
  status: "Not started" | "In progress" | "Done" | "No class";
  notes: string | null;
};

export type AssessmentDto = {
  id: string;
  subjectId: string;
  label: string;
  maxScore: string;
  position: number;
};

export type ChecklistItemDto = {
  id: string;
  subjectId: string;
  weekNumber: number;
  done: boolean;
};

export type SubjectDetailDto = SubjectDto & {
  grading: unknown;
  policies: unknown;
  faculty: unknown;
  semesterLabel: string;
  semesterStartDate?: string | null;
  semesterEndDate?: string | null;
  outcomes: OutcomeDto[];
  planWeeks: PlanWeekDto[];
  assessments: AssessmentDto[];
  checklist: ChecklistItemDto[];
};

/** GET /api/subjects/:id */
export function fetchSubjectDetail(id: string) {
  return apiFetch<SubjectDetailDto>(`/api/subjects/${id}`);
}

/** POST /api/subjects/:id/archive */
export function archiveSubject(id: string) {
  return apiFetch<SubjectDto>(`/api/subjects/${id}/archive`, {
    method: "POST",
    idempotent: true,
  });
}

/** DELETE /api/subjects/:id — soft-archive with typed confirm. */
export function deleteSubject(id: string, confirmCourseCode: string) {
  return apiFetch<{ ok: boolean }>(`/api/subjects/${id}`, {
    method: "DELETE",
    body: { confirmCourseCode },
    idempotent: true,
  });
}

/** GET /api/subjects/:id/export — downloads file (not JSON envelope). */
export async function downloadSubjectExport(
  id: string,
  format: "csv" | "json",
): Promise<{ filename: string; blob: Blob }> {
  const res = await fetch(`/api/subjects/${id}/export?format=${format}`, {
    method: "GET",
    credentials: "same-origin",
    headers: { Accept: format === "json" ? "application/json" : "text/csv" },
  });
  if (!res.ok) {
    let message = res.statusText;
    try {
      const json = (await res.json()) as {
        error?: { message?: string };
      };
      if (json.error?.message) message = json.error.message;
    } catch {
      /* ignore */
    }
    throw new Error(message || "Export failed.");
  }
  const disposition = res.headers.get("Content-Disposition") ?? "";
  const match = /filename="([^"]+)"/.exec(disposition);
  const filename = match?.[1] ?? `subject.${format}`;
  const blob = await res.blob();
  return { filename, blob };
}

/** PATCH /api/subjects/:id */
export function patchSubject(
  id: string,
  body: {
    courseCode?: string;
    title?: string;
    units?: number | string;
    prerequisite?: string | null;
    effectivity?: string | null;
    grading?: unknown;
    policies?: unknown;
    faculty?: unknown;
  },
) {
  return apiFetch<SubjectDto>(`/api/subjects/${id}`, {
    method: "PATCH",
    body,
  });
}

/**
 * Return parsed grading template, or persist DEFAULT and return it when missing.
 * Used so manual / empty Sync subjects match Sync behavior in Calculator.
 */
export async function ensureSubjectGradingTemplate(
  subjectId: string,
  gradingRaw: unknown,
): Promise<GradingTemplateDoc> {
  const parsed = tryParseGradingTemplate(gradingRaw);
  if (parsed) return parsed;
  const doc = serializeGradingTemplate(
    cloneGradingTemplate(DEFAULT_GRADING_TEMPLATE),
  );
  await patchSubject(subjectId, { grading: doc });
  return doc;
}

/** PUT /api/subjects/:id/outcomes */
export function replaceOutcomes(
  id: string,
  outcomes: Array<{
    kind: "PEO" | "PO" | "CO";
    code: string;
    description: string;
    position: number;
  }>,
) {
  return apiFetch<OutcomeDto[]>(`/api/subjects/${id}/outcomes`, {
    method: "PUT",
    body: { outcomes },
  });
}

/** PUT /api/subjects/:id/plan */
export function replacePlan(
  id: string,
  weeks: Array<{
    weekNumber: number;
    position?: number;
    topic?: string | null;
    outcome?: string | null;
    activities?: string | null;
    status?: "Not started" | "In progress" | "Done" | "No class";
    notes?: string | null;
  }>,
) {
  return apiFetch<PlanWeekDto[]>(`/api/subjects/${id}/plan`, {
    method: "PUT",
    body: { weeks },
  });
}

/** POST /api/subjects/:id/plan/skeleton — blank weeks from semester dates if missing. */
export function ensurePlanSkeleton(id: string) {
  return apiFetch<PlanWeekDto[]>(`/api/subjects/${id}/plan/skeleton`, {
    method: "POST",
    idempotent: true,
  });
}

/** PUT /api/subjects/:id/checklist */
export function toggleChecklist(
  id: string,
  weekNumber: number,
  done: boolean,
  planWeekId?: string,
) {
  return apiFetch<ChecklistItemDto>(`/api/subjects/${id}/checklist`, {
    method: "PUT",
    body: {
      weekNumber,
      done,
      ...(planWeekId ? { planWeekId } : {}),
    },
  });
}

/** POST /api/subjects/:id/assessments */
export function createAssessment(
  id: string,
  body: {
    label: string;
    maxScore: number | string;
    position?: number;
    outcomeIds?: string[];
  },
) {
  return apiFetch<AssessmentDto>(`/api/subjects/${id}/assessments`, {
    method: "POST",
    body: { outcomeIds: [], ...body },
    idempotent: true,
  });
}

/** PUT /api/subjects/:id/scores */
export function upsertScores(
  id: string,
  items: Array<{
    assessmentId: string;
    version: number | null;
    score: number | string | null;
    max: number | string;
  }>,
) {
  return apiFetch<{ updated?: unknown }>(`/api/subjects/${id}/scores`, {
    method: "PUT",
    body: { items },
  });
}

/** POST /api/subjects/:id/replace */
export function replaceSubject(
  id: string,
  body: {
    courseCode: string;
    title: string;
    units: number | string;
    prerequisite?: string | null;
    effectivity?: string | null;
  },
) {
  return apiFetch<{
    subject: SubjectDetailDto;
    copied: number;
    skipped: number;
  }>(`/api/subjects/${id}/replace`, {
    method: "POST",
    body,
    idempotent: true,
  });
}
