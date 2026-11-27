-- WHAT: Recreates plan indexes with Prisma-expected hashed names for schema verify.
-- HOW: DROP old names, CREATE `PlanNote_deletedAt_idx_*` and `PlanWeek_*_idx_*`.
-- SCREEN: N/A — query performance for plan notes and week ordering.
-- EDIT: Hashes must match contract emit; update if Prisma renames indexes.
-- KEEP: Required for `db sign` / verify parity with `contract.prisma`.
-- RISK: Medium — brief lock during DROP/CREATE on large tables.
-- Indexes with Prisma contract hashed names (required for db sign / verify).

DROP INDEX IF EXISTS "PlanNote_deletedAt_idx";
DROP INDEX IF EXISTS "PlanWeek_subjectId_weekNumber_position_idx";

CREATE INDEX IF NOT EXISTS "PlanNote_deletedAt_idx_a39f721c"
  ON "PlanNote" ("deletedAt");

CREATE INDEX IF NOT EXISTS "PlanWeek_subjectId_weekNumber_position_idx_7c595068"
  ON "PlanWeek" ("subjectId", "weekNumber", "position");
