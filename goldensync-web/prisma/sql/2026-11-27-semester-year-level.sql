-- Semester academic year level (1–6). Idempotent.
ALTER TABLE "Semester" ADD COLUMN IF NOT EXISTS "yearLevel" INTEGER NOT NULL DEFAULT 1;

-- Add CHECK as NOT VALID so existing rows are not scanned in this transaction.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'semester_year_level_chk'
  ) THEN
    ALTER TABLE "Semester"
      ADD CONSTRAINT semester_year_level_chk
      CHECK ("yearLevel" BETWEEN 1 AND 6) NOT VALID;
  END IF;
END $$;

-- Separate transaction: validate existing rows against the constraint.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'semester_year_level_chk'
      AND NOT convalidated
  ) THEN
    ALTER TABLE "Semester" VALIDATE CONSTRAINT semester_year_level_chk;
  END IF;
END $$;
