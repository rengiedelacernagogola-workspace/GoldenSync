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

/** Delete idempotency rows older than maxAgeHours. */
export async function purgeIdempotencyKeys(
  maxAgeHours = 24,
): Promise<number> {
  const cutoff = new Date(Date.now() - maxAgeHours * 60 * 60 * 1000);
  return await db.orm.public.IdempotencyKey.where((r) =>
    r.createdAt.lt(cutoff),
  ).deleteAndCount();
}

/** Delete expired drafts (expiresAt < now). */
export async function purgeExpiredDrafts(): Promise<number> {
  const now = new Date();
  return await db.orm.public.Draft.where((r) =>
    r.expiresAt.lt(now),
  ).deleteAndCount();
}

/**
 * Clear stale IngestJob.result payloads after TTL (keep row metadata for audit).
 */
export async function purgeStaleIngestResults(
  maxAgeHours: number = limits.INGEST_RESULT_TTL_HOURS,
): Promise<number> {
  const cutoff = new Date(Date.now() - maxAgeHours * 60 * 60 * 1000);
  return await db.orm.public.IngestJob.where((r) => r.updatedAt.lt(cutoff))
    .where((r) => r.result.isNotNull())
    .updateAndCount({ result: null });
}

/**
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
