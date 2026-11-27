-- Semester academic year level (1–6). Idempotent.
ALTER TABLE "Semester" ADD COLUMN IF NOT EXISTS "yearLevel" INTEGER NOT NULL DEFAULT 1;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'semester_year_level_chk'
  ) THEN
    ALTER TABLE "Semester"
      ADD CONSTRAINT semester_year_level_chk
      CHECK ("yearLevel" BETWEEN 1 AND 6);
  END IF;
END $$;
