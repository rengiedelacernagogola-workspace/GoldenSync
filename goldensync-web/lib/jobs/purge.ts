import "server-only";

// WHAT: Deletes old leftover rows (activities, drafts, soft-deleted notes, expired archives).
// HOW: Cron route calls these functions; each deletes/updates with DB WHERE cutoffs (not full-table .all()).
// SCREEN: N/A — keeps the database tidy in the background.
// KEEP: Only run behind cron auth. Do not call from random API routes.
// RISK: High — wrong cutoffs can delete data users still need.
/**
 * Retention purges — activities, idempotency, drafts, notes, ingest results, expired archives.
 * Invoked by GET/POST /api/cron/purge (Vercel Cron + CRON_SECRET).
 */

import { limits } from "@/lib/config/limits";
import { db } from "@/lib/db";
import { purgeOldActivities } from "@/lib/services/activity";
import { purgeSoftDeletedPlanNotes } from "@/lib/services/plan-notes";

/**
 * WHAT: Deletes old “do this only once” keys (IdempotencyKey) past maxAgeHours.
 * HOW: Computes cutoff time → one SQL delete where createdAt is older → returns count removed.
 * EDIT: Change maxAgeHours (default 24) to keep keys longer or shorter.
 * KEEP: Needs IdempotencyKey_createdAt_idx for speed. Ask a developer before changing.
 * RISK: High
 */
/** Delete idempotency rows older than maxAgeHours. */
export async function purgeIdempotencyKeys(
  maxAgeHours = 24,
): Promise<number> {
  const cutoff = new Date(Date.now() - maxAgeHours * 60 * 60 * 1000); // oldest keep date
  return await db.orm.public.IdempotencyKey.where((r) =>
    r.createdAt.lt(cutoff), // createdAt less than cutoff
  ).deleteAndCount();
}

/**
 * WHAT: Deletes autosave drafts whose expiresAt is already past.
 * HOW: One SQL delete where expiresAt < now → returns how many went away.
 * EDIT: Draft TTL is set when drafts are saved (limits.DRAFT_TTL_DAYS), not here.
 * RISK: High
 */
/** Delete expired drafts (expiresAt < now). */
export async function purgeExpiredDrafts(): Promise<number> {
  const now = new Date();
  return await db.orm.public.Draft.where((r) =>
    r.expiresAt.lt(now),
  ).deleteAndCount();
}

/**
 * WHAT: Clears big syllabus-parse JSON on old ingest jobs (keeps the job row).
 * HOW: Finds jobs with result still set and updatedAt older than TTL → sets result to null in bulk.
 * EDIT: Age comes from limits.INGEST_RESULT_TTL_HOURS.
 * KEEP: Do not delete the IngestJob row here — only empty the payload.
 * RISK: High
 *
 * Clear stale IngestJob.result payloads after TTL (keep row metadata for audit).
 */
export async function purgeStaleIngestResults(
  maxAgeHours: number = limits.INGEST_RESULT_TTL_HOURS,
): Promise<number> {
  const cutoff = new Date(Date.now() - maxAgeHours * 60 * 60 * 1000);
  return await db.orm.public.IngestJob.where((r) => r.updatedAt.lt(cutoff))
    .where((r) => r.result.isNotNull()) // only rows that still hold JSON
    .updateAndCount({ result: null });
}

/**
 * WHAT: Permanently removes subjects archived longer than ARCHIVE_RESTORE_DAYS.
 * HOW: SQL delete where archivedAt is set and older than cutoff (children cascade via FK).
 * EDIT: Days come from limits.ARCHIVE_RESTORE_DAYS.
 * SCREEN: Those subjects disappear from Account → Archived; cannot restore after this.
 * RISK: High — ask a developer first; data cannot come back.
 *
 * Hard-delete subjects past ARCHIVE_RESTORE_DAYS (cascade children via FK).
 */
export async function purgeExpiredArchivedSubjects(
  maxAgeDays: number = limits.ARCHIVE_RESTORE_DAYS,
): Promise<number> {
  const cutoff = new Date(Date.now() - maxAgeDays * 24 * 60 * 60 * 1000);
  return await db.orm.public.Subject.where((r) => r.archivedAt.isNotNull())
    .where((r) => r.archivedAt.lt(cutoff))
    .deleteAndCount();
}

/**
 * WHAT: Runs every purge job in parallel and returns each count.
 * HOW: Promise.all of activities, keys, drafts, notes, ingest JSON, archived subjects.
 * SCREEN: Nothing — called by the cron API route on a schedule.
 * RISK: High
 */
/** Run all purge sweeps; returns counts. */
export async function runPurgeJobs(): Promise<{
  activities: number;
  idempotency: number;
  drafts: number;
  softDeletedNotes: number;
  ingestResults: number;
  archivedSubjects: number;
}> {
  const [
    activities,
    idempotency,
    drafts,
    softDeletedNotes,
    ingestResults,
    archivedSubjects,
  ] = await Promise.all([
    purgeOldActivities(90),
    purgeIdempotencyKeys(24),
    purgeExpiredDrafts(),
    purgeSoftDeletedPlanNotes(),
    purgeStaleIngestResults(),
    purgeExpiredArchivedSubjects(),
  ]);
  return {
    activities,
    idempotency,
    drafts,
    softDeletedNotes,
    ingestResults,
    archivedSubjects,
  };
}
