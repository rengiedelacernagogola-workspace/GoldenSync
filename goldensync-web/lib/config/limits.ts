/**
 * WHAT: Product caps (PDF size, how many subjects, rate limits, grade thresholds).
 * HOW: Other code imports `limits` instead of hardcoding numbers.
 * SCREEN: Hitting a cap may show "limit reached" style errors.
 * EDIT: Change a number here to raise/lower a product limit.
 * KEEP: Single source of truth — do not copy these numbers elsewhere.
 * RISK: High — wrong caps affect uploads, security rate limits, and grades.
 *
 * Product limits (architecture Appendix C).
 * Rate-limit and ingest caps read these — do not hardcode elsewhere.
 */

export const limits = {
  MAX_PDF_BYTES: 10 * 1024 * 1024,
  MAX_PDF_PAGES: 60,
  INGEST_PER_HOUR: 10,
  UPLOAD_TOKENS_PER_HOUR: 30,
  MAX_ACTIVE_SUBJECTS_PER_SEMESTER: 20,
  MAX_SEMESTERS_PER_USER: 30,
  MAX_OUTCOMES: 20,
  MAX_ACTIVITIES: 150,
  /** Max distinct week numbers (1–30). */
  MAX_PLAN_WEEKS: 30,
  /** Max PlanWeek rows per subject (multiple topics per week allowed). */
  MAX_PLAN_ENTRIES: 90,
  MAX_SCORE_VALUE: 10_000,
  ATTAINMENT_THRESHOLD: 60,
  INTERVENTION_THRESHOLD: 60,
  BEST_GRADE_INTERVENTION_B: 3.0,
  GRADE_FAILED: 5.0,
  ARCHIVE_RESTORE_DAYS: 30,
  /** Soft-deleted PlanNote rows are purged after this many days. */
  NOTE_SOFT_DELETE_DAYS: 30,
  DRAFT_TTL_DAYS: 7,
  INGEST_RESULT_TTL_HOURS: 24,
  MIN_EXTRACTED_CHARS: 200,
  READ_RATE_PER_MINUTE: 120,
  WRITE_RATE_PER_MINUTE: 60,
  TIME_ZONE: "Asia/Manila",
} as const;
