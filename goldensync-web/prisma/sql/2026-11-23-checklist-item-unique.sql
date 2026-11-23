-- Enforce one ChecklistItem per (subjectId, weekNumber).
-- Deduplicate legacy rows (keep lowest id), then add unique index.

DELETE FROM "ChecklistItem" a
USING "ChecklistItem" b
WHERE a."subjectId" = b."subjectId"
  AND a."weekNumber" = b."weekNumber"
  AND a.id > b.id;

CREATE UNIQUE INDEX IF NOT EXISTS "ChecklistItem_subjectId_weekNumber_key"
  ON "ChecklistItem" ("subjectId", "weekNumber");
