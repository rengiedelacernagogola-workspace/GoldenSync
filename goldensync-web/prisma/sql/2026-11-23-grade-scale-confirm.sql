-- Production release gate: confirm GradeScale bands for Calculator grade mapping.
UPDATE "GradeScaleMeta"
SET "confirmed" = true,
    "updatedAt" = NOW()
WHERE "confirmed" = false
   OR "confirmed" IS DISTINCT FROM true;
