-- WHAT: Indexes for rewritten purge / Notes / OutcomeLink query paths.
-- HOW: Idempotent CREATE INDEX IF NOT EXISTS on cutoff and filter columns.
-- SCREEN: N/A — faster cron and Notes hub as data grows.
-- KEEP: Names stable; pair with @@index in contract.prisma.
-- RISK: Medium — brief locks on large tables during CREATE INDEX.

-- Subject: purge expired archives (archivedAt < cutoff)
CREATE INDEX IF NOT EXISTS "Subject_archivedAt_idx"
  ON "Subject" ("archivedAt");

-- PlanNote: active library filters (subjectId + shelved nulls)
CREATE INDEX IF NOT EXISTS "PlanNote_subjectId_archivedAt_deletedAt_idx"
  ON "PlanNote" ("subjectId", "archivedAt", "deletedAt");

-- IdempotencyKey: purge by createdAt
CREATE INDEX IF NOT EXISTS "IdempotencyKey_createdAt_idx"
  ON "IdempotencyKey" ("createdAt");

-- ActivityEvent: global retention purge by createdAt
CREATE INDEX IF NOT EXISTS "ActivityEvent_createdAt_idx"
  ON "ActivityEvent" ("createdAt");

-- IngestJob: clear stale result JSON by updatedAt
CREATE INDEX IF NOT EXISTS "IngestJob_updatedAt_idx"
  ON "IngestJob" ("updatedAt");

-- Draft: purge expired drafts
CREATE INDEX IF NOT EXISTS "Draft_expiresAt_idx"
  ON "Draft" ("expiresAt");
