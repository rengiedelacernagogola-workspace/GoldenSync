/**
 * Syllabus ingest client — Blob upload → enqueue → poll job.
 */

import { upload } from "@vercel/blob/client";

import { apiFetch } from "@/lib/api/client";

export type IngestJobDto = {
  id: string;
  status: string;
  blobPathname: string | null;
  result: unknown;
  errorCode: string | null;
  createdAt: string;
  updatedAt: string;
};

export type IngestDraftOutcome = {
  kind: "PEO" | "PO" | "CO";
  code: string;
  description: string;
};

export type IngestDraftAssessment = {
  label: string;
  maxScore: string | null;
};

export type IngestDraft = {
  courseCode: string | null;
  title: string | null;
  units: string | number | null;
  outcomes: IngestDraftOutcome[];
  planWeeks: Array<{ weekNumber: number; topic?: string | null }>;
  assessments: IngestDraftAssessment[];
  prerequisite?: string | null;
  effectivity?: string | null;
  classPolicies?: string | null;
  facultyName?: string | null;
  gradingBlurb?: string | null;
  /** Structured Part IV template when extractors found CO weight groups. */
  gradingTemplate?: unknown | null;
  previewLines?: string[];
};

/** Build ingest/{userId}/{uuid}.pdf pathname. */
export function buildIngestPathname(userId: string, fileName: string): string {
  const safe = fileName.replace(/[^a-zA-Z0-9._-]+/g, "_").slice(0, 80);
  const uuid =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `f-${Date.now()}`;
  const base = safe.toLowerCase().endsWith(".pdf") ? safe : `${safe || "syllabus"}.pdf`;
  return `ingest/${userId}/${uuid}-${base}`;
}

/** Client upload to private Blob via /api/blob/upload token. */
export async function uploadSyllabusPdf(userId: string, file: File) {
  const pathname = buildIngestPathname(userId, file.name);
  const blob = await upload(pathname, file, {
    access: "private",
    handleUploadUrl: "/api/blob/upload",
    contentType: "application/pdf",
  });
  return { pathname: blob.pathname, url: blob.url };
}

/** POST /api/subjects/ingest */
export function enqueueIngest(pathname: string) {
  return apiFetch<IngestJobDto>("/api/subjects/ingest", {
    method: "POST",
    body: { pathname },
    idempotent: true,
  });
}

/** GET /api/subjects/ingest/:jobId */
export function fetchIngestJob(jobId: string) {
  return apiFetch<IngestJobDto>(`/api/subjects/ingest/${jobId}`);
}

const TERMINAL = new Set([
  "NEEDS_REVIEW",
  "CONFIRMED",
  "FAILED",
  "EXPIRED",
]);

/** Poll until terminal status or timeout (default 60s, 2s interval). */
export async function pollIngestJob(
  jobId: string,
  opts?: { intervalMs?: number; timeoutMs?: number; signal?: AbortSignal },
): Promise<IngestJobDto> {
  const intervalMs = opts?.intervalMs ?? 2000;
  const timeoutMs = opts?.timeoutMs ?? 120_000;
  const started = Date.now();

  for (;;) {
    if (opts?.signal?.aborted) {
      throw new Error("Ingest poll aborted.");
    }
    const job = await fetchIngestJob(jobId);
    if (TERMINAL.has(job.status)) return job;
    if (Date.now() - started >= timeoutMs) {
      throw new Error("Ingest timed out.");
    }
    await new Promise((r) => window.setTimeout(r, intervalMs));
  }
}

/** Pull draft object from job.result when present. */
export function extractIngestDraft(result: unknown): IngestDraft | null {
  if (!result || typeof result !== "object") return null;
  const draft = (result as { draft?: unknown }).draft;
  if (!draft || typeof draft !== "object") return null;
  return draft as IngestDraft;
}
