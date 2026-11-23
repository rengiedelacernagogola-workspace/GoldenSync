SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename IN ('PlanNote','ManualChecklistItem','ActivityEvent','OutcomeLink','IdempotencyKey') ORDER BY 1;
