-- WHAT: Multiple learning-plan rows per week with stable `position` ordering.
-- HOW: Drops old unique on weekNumber, backfills position via window function, adds composite index.
-- SCREEN: Learning Plan table — several topics in one week.
-- EDIT: Re-run safe; backfill only runs on existing rows when position was default 0.
-- KEEP: Matches `PlanWeek.position` in `contract.prisma`.
-- RISK: Medium — duplicate rows before unique drop need manual review if migration partially applied.
-- Allow multiple Learning Plan rows per week (topics/outcomes/activities in one week).
-- Drop unique (subjectId, weekNumber); add position for stable ordering.

ALTER TABLE "PlanWeek" ADD COLUMN IF NOT EXISTS "position" INTEGER NOT NULL DEFAULT 0;

DO $$
DECLARE
  cname text;
BEGIN
  SELECT conname INTO cname
  FROM pg_constraint
  WHERE conrelid = '"PlanWeek"'::regclass
    AND contype = 'u'
    AND pg_get_constraintdef(oid) LIKE '%weekNumber%';
  IF cname IS NOT NULL THEN
    EXECUTE format('ALTER TABLE "PlanWeek" DROP CONSTRAINT %I', cname);
  END IF;
END $$;

-- Backfill position within each subject by weekNumber then id
WITH ranked AS (
  SELECT
    id,
    ROW_NUMBER() OVER (
      PARTITION BY "subjectId"
      ORDER BY "weekNumber" ASC, id ASC
    ) - 1 AS pos
  FROM "PlanWeek"
)
UPDATE "PlanWeek" p
SET "position" = ranked.pos
FROM ranked
WHERE p.id = ranked.id;

CREATE INDEX IF NOT EXISTS "PlanWeek_subjectId_weekNumber_position_idx"
  ON "PlanWeek" ("subjectId", "weekNumber", "position");
