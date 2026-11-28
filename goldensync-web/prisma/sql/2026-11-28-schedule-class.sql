-- WHAT: Creates ScheduleClass table for My Schedule (user-owned timetable).
-- HOW: Enum ScheduleMode + table + indexes; idempotent IF NOT EXISTS.
-- SCREEN: /my-schedule day tabs and class cards.
-- KEEP: dayOfWeek 1=Mon … 7=Sun; startTime/endTime as HH:mm text. Pair with contract.prisma.
-- RISK: Medium — run via apply-all-constraints.mjs before relying on the feature.

DO $$ BEGIN
  CREATE TYPE "ScheduleMode" AS ENUM ('FACE_TO_FACE', 'ONLINE');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS "ScheduleClass" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "courseCode" TEXT NOT NULL,
  "courseTitle" TEXT NOT NULL,
  "dayOfWeek" INTEGER NOT NULL,
  "startTime" TEXT NOT NULL,
  "endTime" TEXT NOT NULL,
  "location" TEXT NOT NULL,
  "mode" "ScheduleMode" NOT NULL,
  "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ScheduleClass_pkey" PRIMARY KEY ("id")
);

DO $$ BEGIN
  ALTER TABLE "ScheduleClass"
    ADD CONSTRAINT "ScheduleClass_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

CREATE INDEX IF NOT EXISTS "ScheduleClass_userId_idx"
  ON "ScheduleClass" ("userId");

CREATE INDEX IF NOT EXISTS "ScheduleClass_userId_dayOfWeek_idx"
  ON "ScheduleClass" ("userId", "dayOfWeek");
