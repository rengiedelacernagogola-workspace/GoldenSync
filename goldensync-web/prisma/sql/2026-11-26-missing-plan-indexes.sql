-- Indexes with Prisma contract hashed names (required for db sign / verify).

DROP INDEX IF EXISTS "PlanNote_deletedAt_idx";
DROP INDEX IF EXISTS "PlanWeek_subjectId_weekNumber_position_idx";

CREATE INDEX IF NOT EXISTS "PlanNote_deletedAt_idx_a39f721c"
  ON "PlanNote" ("deletedAt");

CREATE INDEX IF NOT EXISTS "PlanWeek_subjectId_weekNumber_position_idx_7c595068"
  ON "PlanWeek" ("subjectId", "weekNumber", "position");
