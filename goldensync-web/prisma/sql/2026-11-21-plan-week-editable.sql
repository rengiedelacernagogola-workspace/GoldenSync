-- WHAT: Text columns for editable week row fields beyond core topic.
-- HOW: `ADD COLUMN IF NOT EXISTS` for outcome, activities, status.
-- SCREEN: Learning Plan inline edit and checklist status column.
-- EDIT: Add columns here if new week fields persist in DB.
-- KEEP: Status strings match UI enums (Not started, In progress, Done, No class).
-- RISK: Low
-- Editable Learning Plan columns (topic/outcome/activities/status).
ALTER TABLE "PlanWeek" ADD COLUMN IF NOT EXISTS "outcome" TEXT;
ALTER TABLE "PlanWeek" ADD COLUMN IF NOT EXISTS "activities" TEXT;
ALTER TABLE "PlanWeek" ADD COLUMN IF NOT EXISTS "status" TEXT;
