-- WHAT: Indexes for rewritten purge / Notes / OutcomeLink query paths.
-- HOW: Idempotent CREATE INDEX IF NOT EXISTS on cutoff and filter columns.
-- SCREEN: N/A — faster cron and Notes hub as data grows.
-- KEEP: Names stable; pair with @@index in contract.prisma.
-- RISK: Medium — brief locks on large tables during CREATE INDEX.

-- WHAT: Helps purgeExpiredArchivedSubjects find old archivedAt rows fast.
-- Subject: purge expired archives (archivedAt < cutoff)
CREATE INDEX IF NOT EXISTS "Subject_archivedAt_idx"
  ON "Subject" ("archivedAt");

-- WHAT: Helps listPlanNotes / pin checks filter active notes by subject without a full scan.
-- PlanNote: active library filters (subjectId + shelved nulls)
CREATE INDEX IF NOT EXISTS "PlanNote_subjectId_archivedAt_deletedAt_idx"
  ON "PlanNote" ("subjectId", "archivedAt", "deletedAt");

-- WHAT: Helps purgeIdempotencyKeys delete by age.
-- IdempotencyKey: purge by createdAt
CREATE INDEX IF NOT EXISTS "IdempotencyKey_createdAt_idx"
  ON "IdempotencyKey" ("createdAt");

-- WHAT: Helps purgeOldActivities delete everyone’s old feed rows by age.
-- ActivityEvent: global retention purge by createdAt
CREATE INDEX IF NOT EXISTS "ActivityEvent_createdAt_idx"
  ON "ActivityEvent" ("createdAt");

-- WHAT: Helps purgeStaleIngestResults clear old result JSON by updatedAt.
-- IngestJob: clear stale result JSON by updatedAt
CREATE INDEX IF NOT EXISTS "IngestJob_updatedAt_idx"
  ON "IngestJob" ("updatedAt");

-- WHAT: Helps purgeExpiredDrafts delete drafts past expiresAt.
-- Draft: purge expired drafts
CREATE INDEX IF NOT EXISTS "Draft_expiresAt_idx"
  ON "Draft" ("expiresAt");
