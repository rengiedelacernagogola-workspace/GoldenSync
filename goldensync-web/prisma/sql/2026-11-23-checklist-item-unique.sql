-- WHAT: One checklist row per subject per week — removes duplicates then unique index.
-- HOW: DELETE self-join keeps lower `id`; `CREATE UNIQUE INDEX IF NOT EXISTS`.
-- SCREEN: Weekly checklist toggle per week in subject view.
-- EDIT: Only if checklist model changes to multiple items per week.
-- KEEP: Destructive dedupe — backup before first run on prod with bad data.
-- RISK: High on prod — deletes duplicate checklist rows irreversibly.
-- Enforce one ChecklistItem per (subjectId, weekNumber).
-- Deduplicate legacy rows (keep lowest id), then add unique index.

DELETE FROM "ChecklistItem" a
USING "ChecklistItem" b
WHERE a."subjectId" = b."subjectId"
  AND a."weekNumber" = b."weekNumber"
  AND a.id > b.id;

CREATE UNIQUE INDEX IF NOT EXISTS "ChecklistItem_subjectId_weekNumber_key"
  ON "ChecklistItem" ("subjectId", "weekNumber");
