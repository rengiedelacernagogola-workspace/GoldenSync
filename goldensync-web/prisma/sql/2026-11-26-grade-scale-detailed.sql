-- WHAT: Replaces all GradeScale rows with full CSU-style band table and confirms meta.
-- HOW: DELETE all bands, INSERT ten rows, UPDATE GradeScaleMeta confirmed.
-- SCREEN: Grade Calculator numerical grade from class average.
-- EDIT: Band bounds must match `lib/domain/grade-scale.ts` DETAILED_GRADE_BANDS.
-- KEEP: Not idempotent on data — wipes custom bands every run; intended for controlled deploys.
-- RISK: High — DELETE removes operator-tuned bands.
-- Replace coarse GradeScale (3 bands) with detailed CSU-style bands
-- aligned to lib/domain/grade-scale.ts DETAILED_GRADE_BANDS.

DELETE FROM "GradeScale";

INSERT INTO "GradeScale" ("id", "minAverage", "maxAverage", "grade", "position")
VALUES
  ('gs-band-fail', 0,      59.99, 5.0,  1),
  ('gs-band-3-0',  60,     64.99, 3.0,  2),
  ('gs-band-2-75', 65,     69.99, 2.75, 3),
  ('gs-band-2-5',  70,     74.99, 2.5,  4),
  ('gs-band-2-25', 75,     79.99, 2.25, 5),
  ('gs-band-2-0',  80,     84.99, 2.0,  6),
  ('gs-band-1-75', 85,     88.99, 1.75, 7),
  ('gs-band-1-5',  89,     92.99, 1.5,  8),
  ('gs-band-1-25', 93,     96.99, 1.25, 9),
  ('gs-band-1-0',  97,     100,   1.0,  10);

UPDATE "GradeScaleMeta"
SET "confirmed" = true, "updatedAt" = NOW()
WHERE id IN (SELECT id FROM "GradeScaleMeta" LIMIT 1);
