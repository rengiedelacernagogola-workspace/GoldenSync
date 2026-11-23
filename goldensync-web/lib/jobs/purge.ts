import "server-only";

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
  const rows = await db.orm.public.IdempotencyKey.where({}).all();
  let deleted = 0;
  for (const row of rows) {
    const created =
      row.createdAt instanceof Date
        ? row.createdAt
        : new Date(String(row.createdAt));
    if (created < cutoff) {
      await db.orm.public.IdempotencyKey.where({ id: row.id }).delete();
      deleted += 1;
    }
  }
  return deleted;
}

/** Delete expired drafts (expiresAt < now). */
export async function purgeExpiredDrafts(): Promise<number> {
  const now = new Date();
  const rows = await db.orm.public.Draft.where({}).all();
  let deleted = 0;
  for (const row of rows) {
    const expires =
      row.expiresAt instanceof Date
        ? row.expiresAt
        : new Date(String(row.expiresAt));
    if (expires < now) {
      await db.orm.public.Draft.where({ id: row.id }).delete();
      deleted += 1;
    }
  }
  return deleted;
}

/**
 * Clear stale IngestJob.result payloads after TTL (keep row metadata for audit).
 */
export async function purgeStaleIngestResults(
  maxAgeHours: number = limits.INGEST_RESULT_TTL_HOURS,
): Promise<number> {
  const cutoff = new Date(Date.now() - maxAgeHours * 60 * 60 * 1000);
  const rows = await db.orm.public.IngestJob.where({}).all();
  let cleared = 0;
  for (const row of rows) {
    if (row.result == null) continue;
    const updated =
      row.updatedAt instanceof Date
        ? row.updatedAt
        : new Date(String(row.updatedAt));
    if (updated >= cutoff) continue;
    await db.orm.public.IngestJob.where({ id: row.id }).update({
      result: null,
    });
    cleared += 1;
  }
  return cleared;
}

/**
 * Hard-delete subjects past ARCHIVE_RESTORE_DAYS (cascade children via FK).
 */
export async function purgeExpiredArchivedSubjects(
  maxAgeDays: number = limits.ARCHIVE_RESTORE_DAYS,
): Promise<number> {
  const cutoff = new Date(Date.now() - maxAgeDays * 24 * 60 * 60 * 1000);
  const rows = await db.orm.public.Subject.where({}).all();
  let deleted = 0;
  for (const row of rows) {
    if (row.archivedAt == null) continue;
    const archived =
      row.archivedAt instanceof Date
        ? row.archivedAt
        : new Date(String(row.archivedAt));
    if (archived >= cutoff) continue;
    await db.orm.public.Subject.where({ id: row.id }).delete();
    deleted += 1;
  }
  return deleted;
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
