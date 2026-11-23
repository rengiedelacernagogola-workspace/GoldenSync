-- Editable Learning Plan columns (topic/outcome/activities/status).
ALTER TABLE "PlanWeek" ADD COLUMN IF NOT EXISTS "outcome" TEXT;
ALTER TABLE "PlanWeek" ADD COLUMN IF NOT EXISTS "activities" TEXT;
ALTER TABLE "PlanWeek" ADD COLUMN IF NOT EXISTS "status" TEXT;
