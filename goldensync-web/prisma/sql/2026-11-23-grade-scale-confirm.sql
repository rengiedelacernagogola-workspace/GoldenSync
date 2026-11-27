-- WHAT: Flips GradeScaleMeta.confirmed so Calculator may use DB bands in production.
-- HOW: Single UPDATE setting confirmed true when false/null.
-- SCREEN: Admin / release gate before grade scale goes live.
-- EDIT: Prefer `grade-scale-detailed.sql` for full band replacement + confirm together.
-- KEEP: Run after bands exist; without rows in GradeScale, calculator still errors.
-- RISK: Medium — confirming wrong bands locks wrong grades until meta reset.
-- Production release gate: confirm GradeScale bands for Calculator grade mapping.
UPDATE "GradeScaleMeta"
SET "confirmed" = true,
    "updatedAt" = NOW()
WHERE "confirmed" = false
   OR "confirmed" IS DISTINCT FROM true;
