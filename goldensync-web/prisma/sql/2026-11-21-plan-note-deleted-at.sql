-- Soft-delete column for PlanNote (30-day trash before purge).
ALTER TABLE "PlanNote" ADD COLUMN IF NOT EXISTS "deletedAt" TIMESTAMPTZ(3);
CREATE INDEX IF NOT EXISTS "PlanNote_deletedAt_idx" ON "PlanNote" ("deletedAt");
