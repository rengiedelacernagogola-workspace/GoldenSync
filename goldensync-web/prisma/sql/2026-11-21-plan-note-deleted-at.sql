-- WHAT: Adds soft-delete timestamp on PlanNote for trash-before-purge workflow.
-- HOW: `deletedAt` column + index for purge queries.
-- SCREEN: Learning Plan notes trash / restore UI.
-- EDIT: Retention days live in app config, not this file.
-- KEEP: Idempotent `IF NOT EXISTS`; index name may be replaced by hashed migration later.
-- RISK: Low
-- Soft-delete column for PlanNote (30-day trash before purge).
ALTER TABLE "PlanNote" ADD COLUMN IF NOT EXISTS "deletedAt" TIMESTAMPTZ(3);
CREATE INDEX IF NOT EXISTS "PlanNote_deletedAt_idx" ON "PlanNote" ("deletedAt");
