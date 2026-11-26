-- Constraints + GradeScale seed (local Docker; mirror to Neon develop when wired)

CREATE UNIQUE INDEX IF NOT EXISTS subject_active_code_per_semester
  ON "Subject" ("semesterId", "courseCodeNorm")
  WHERE "archivedAt" IS NULL;

ALTER TABLE "Score" DROP CONSTRAINT IF EXISTS score_bounds_chk;
ALTER TABLE "Score" ADD CONSTRAINT score_bounds_chk
  CHECK ("max" > 0 AND "max" <= 10000 AND ("score" IS NULL OR ("score" >= 0 AND "score" <= "max"))) NOT VALID;
ALTER TABLE "Score" VALIDATE CONSTRAINT score_bounds_chk;

ALTER TABLE "Semester" DROP CONSTRAINT IF EXISTS semester_dates_chk;
ALTER TABLE "Semester" ADD CONSTRAINT semester_dates_chk
  CHECK ("endDate" > "startDate") NOT VALID;
ALTER TABLE "Semester" VALIDATE CONSTRAINT semester_dates_chk;

ALTER TABLE "PlanNote" DROP CONSTRAINT IF EXISTS "PlanNote_importance_chk";
ALTER TABLE "PlanNote" ADD CONSTRAINT "PlanNote_importance_chk"
  CHECK ("importance" BETWEEN 1 AND 3);

-- GradeScale seed (idempotent). confirmed=false until owner confirms (release gate).
INSERT INTO "GradeScaleMeta" ("id", "confirmed", "updatedAt")
SELECT 'gs-meta-local-1', false, NOW()
WHERE NOT EXISTS (SELECT 1 FROM "GradeScaleMeta");

INSERT INTO "GradeScale" ("id", "minAverage", "maxAverage", "grade", "position")
SELECT v.id, v.min_a, v.max_a, v.grade, v.pos
FROM (VALUES
  ('gs-band-fail', 0::numeric, 59.99::numeric, 5.0::numeric, 1),
  ('gs-band-3-0', 60::numeric, 64.99::numeric, 3.0::numeric, 2),
  ('gs-band-2-75', 65::numeric, 69.99::numeric, 2.75::numeric, 3),
  ('gs-band-2-5', 70::numeric, 74.99::numeric, 2.5::numeric, 4),
  ('gs-band-2-25', 75::numeric, 79.99::numeric, 2.25::numeric, 5),
  ('gs-band-2-0', 80::numeric, 84.99::numeric, 2.0::numeric, 6),
  ('gs-band-1-75', 85::numeric, 88.99::numeric, 1.75::numeric, 7),
  ('gs-band-1-5', 89::numeric, 92.99::numeric, 1.5::numeric, 8),
  ('gs-band-1-25', 93::numeric, 96.99::numeric, 1.25::numeric, 9),
  ('gs-band-1-0', 97::numeric, 100::numeric, 1.0::numeric, 10)
) AS v(id, min_a, max_a, grade, pos)
WHERE NOT EXISTS (SELECT 1 FROM "GradeScale");
