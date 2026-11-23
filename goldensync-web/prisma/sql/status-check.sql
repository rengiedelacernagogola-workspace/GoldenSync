SELECT tablename
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN (
    'PlanNote',
    'ManualChecklistItem',
    'ActivityEvent',
    'OutcomeLink',
    'IdempotencyKey'
  )
ORDER BY 1;

SELECT count(*) AS grade_bands FROM "GradeScale";
SELECT confirmed FROM "GradeScaleMeta";

SELECT indexname
FROM pg_indexes
WHERE indexname = 'subject_active_code_per_semester';

SELECT conname
FROM pg_constraint
WHERE conname IN (
  'score_bounds_chk',
  'semester_dates_chk',
  'PlanNote_importance_chk'
)
ORDER BY 1;
