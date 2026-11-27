import "server-only";

// WHAT: Start PDF ingest job and return status/result to client.
// HOW: Validates blob path + enqueues; calls processIngestJob synchronously in prod.
// SCREEN: Syllabus upload wizard.
// EDIT: Error code mapping to UI messages.
// KEEP: isValidIngestPathname before any blob read.
// RISK: High — auth + blob + database.

/**
 * Syllabus ingest enqueue + status (architecture §9).
 * Production path: parse synchronously in Next.js via processIngestJob
 * (Trigger.dev pdf.worker bundling is unreliable — do not depend on it for prod).
 */

import { limits } from "@/lib/config/limits";
import { isValidIngestPathname } from "@/lib/domain/ingest-path";
import { db } from "@/lib/db";
import { AppError, notFound, validationFailed } from "@/lib/http/errors";
import { processIngestJob } from "@/lib/services/ingest-process";
import type { EnqueueIngestInput } from "@/lib/validation/ingest";

export type IngestJobDto = {
  id: string;
  status: string;
  blobPathname: string | null;
  result: unknown;
  errorCode: string | null;
  createdAt: string;
  updatedAt: string;
};

function mapJob(row: {
  id: string;
  status: unknown;
  blobPathname: string | null;
  result: unknown;
  errorCode: string | null;
  createdAt: unknown;
  updatedAt: unknown;
}): IngestJobDto {
  return {
    id: row.id,
    status: String(row.status),
    blobPathname: row.blobPathname,
    result: row.result ?? null,
    errorCode: row.errorCode,
    createdAt:
      row.createdAt instanceof Date
        ? row.createdAt.toISOString()
        : String(row.createdAt),
    updatedAt:
      row.updatedAt instanceof Date
        ? row.updatedAt.toISOString()
        : String(row.updatedAt),
  };
}

/** Count ingest jobs created in the last hour for rate limiting. */
async function ingestCountLastHour(userId: string): Promise<number> {
  const since = new Date(Date.now() - 60 * 60 * 1000);
  const rows = await db.orm.public.IngestJob.where({ userId }).all();
  return rows.filter((j) => {
    const created =
      j.createdAt instanceof Date ? j.createdAt : new Date(String(j.createdAt));
    return created >= since;
  }).length;
}

/**
 * Enqueue a parse job after path + rate checks.
 * Returns job DTO for 202 Accepted.
 */
export async function enqueueIngest(
  userId: string,
  input: EnqueueIngestInput,
): Promise<IngestJobDto> {
  if (!isValidIngestPathname(input.pathname, userId)) {
    throw validationFailed(
      "pathname must be ingest/{userId}/{file}.pdf under your account.",
    );
  }

  const count = await ingestCountLastHour(userId);
  if (count >= limits.INGEST_PER_HOUR) {
    throw new AppError(
      "RATE_LIMITED",
      `At most ${limits.INGEST_PER_HOUR} ingest jobs per hour.`,
    );
  }

  const row = await db.orm.public.IngestJob.create({
    userId,
    status: "QUEUED",
    blobPathname: input.pathname,
    result: null,
    errorCode: null,
  });

  /**
   * Parse in the Next.js server (not Trigger).
   * Trigger's bundler cannot load pdf-parse's pdf.worker.mjs — that caused INTERNAL failures.
   * Sync process here is the deploy-safe path; client still polls for the terminal status.
   */
  await processIngestJob(row.id, userId);

  const updated = await db.orm.public.IngestJob.where({ id: row.id }).first();
  return mapJob(updated ?? row);
}

/** Mark RUNNING jobs that never finished (serverless timeout / crash). */
const STALE_RUNNING_MS = 3 * 60 * 1000;

/** Owner-scoped job read. Recovers stale RUNNING → FAILED so clients can terminate. */
export async function getIngestJob(
  userId: string,
  jobId: string,
): Promise<IngestJobDto> {
  const row = await db.orm.public.IngestJob.where({
    id: jobId,
    userId,
  }).first();
  if (!row) throw notFound();

  if (String(row.status) === "RUNNING") {
    const updatedAt =
      row.updatedAt instanceof Date
        ? row.updatedAt
        : new Date(String(row.updatedAt));
    if (Date.now() - updatedAt.getTime() >= STALE_RUNNING_MS) {
      await db.orm.public.IngestJob.where({ id: row.id }).update({
        status: "FAILED",
        errorCode: "PARSE_TIMEOUT",
        result: {
          message:
            "Ingest stayed RUNNING past the server timeout; re-upload the syllabus.",
          code: "stale_running",
        },
      });
      const refreshed = await db.orm.public.IngestJob.where({
        id: jobId,
        userId,
      }).first();
      if (refreshed) return mapJob(refreshed);
    }
  }

  return mapJob(row);
}
