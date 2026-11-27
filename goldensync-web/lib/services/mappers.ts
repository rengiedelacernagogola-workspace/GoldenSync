// WHAT: Convert database rows into API-friendly DTO types (dates, decimals, JSON).
// HOW: Pure mapping functions — no I/O except called from services/queries.
// EDIT: Add fields here when schema changes; update every map* function.
// KEEP: API routes should only expose DTOs, not raw ORM shapes.
// RISK: Low — but wrong mapping leaks internal fields or breaks clients.

/**
 * Map ORM rows to API DTOs — never return raw Prisma/ORM rows (architecture §15).
 */

export type SemesterDto = {
  id: string;
  label: string;
  yearLevel: number;
  startDate: string;
  endDate: string;
  skippedWeeks: number[];
  createdAt: string;
};

export type SubjectDto = {
  id: string;
  semesterId: string;
  courseCode: string;
  courseCodeNorm: string;
  title: string;
  units: string;
  prerequisite: string | null;
  effectivity: string | null;
  grading: unknown;
  policies: unknown;
  faculty: unknown;
  archivedAt: string | null;
  createdAt: string;
};

export type OutcomeKindDto = "PEO" | "PO" | "CO";

export type OutcomeDto = {
  id: string;
  subjectId: string;
  kind: OutcomeKindDto;
  code: string;
  description: string;
  position: number;
};

export type PlanWeekStatusDto =
  | "Not started"
  | "In progress"
  | "Done"
  | "No class";

export type PlanWeekDto = {
  id: string;
  subjectId: string;
  weekNumber: number;
  position: number;
  topic: string | null;
  outcome: string | null;
  activities: string | null;
  status: PlanWeekStatusDto;
  notes: string | null;
};

export type AssessmentDto = {
  id: string;
  subjectId: string;
  label: string;
  maxScore: string;
  position: number;
};

export type ChecklistItemDto = {
  id: string;
  subjectId: string;
  weekNumber: number;
  done: boolean;
};

/** Subject plus nested Phase 1 children (read path). */
export type SubjectDetailDto = SubjectDto & {
  /** Owning semester label for module shells (never seed fallback). */
  semesterLabel: string;
  /** Semester window for contact-hours countdown (ISO). */
  semesterStartDate?: string | null;
  semesterEndDate?: string | null;
  outcomes: OutcomeDto[];
  planWeeks: PlanWeekDto[];
  assessments: AssessmentDto[];
  checklist: ChecklistItemDto[];
};

/** ISO date string from Date or already-string values. */
function toIso(value: unknown): string {
  if (value instanceof Date) return value.toISOString();
  if (typeof value === "string") return value;
  return String(value);
}

/** Parse skippedWeeks JSON to number[]. */
export function parseSkippedWeeks(raw: unknown): number[] {
  if (Array.isArray(raw)) {
    return raw.filter((n): n is number => typeof n === "number");
  }
  return [];
}

/** Map semester ORM row → DTO. */
export function mapSemester(row: {
  id: string;
  label: string;
  yearLevel?: number | null;
  startDate: unknown;
  endDate: unknown;
  skippedWeeks: unknown;
  createdAt: unknown;
}): SemesterDto {
  const yearLevel =
    typeof row.yearLevel === "number" && row.yearLevel >= 1
      ? row.yearLevel
      : 1;
  return {
    id: row.id,
    label: row.label,
    yearLevel,
    startDate: toIso(row.startDate),
    endDate: toIso(row.endDate),
    skippedWeeks: parseSkippedWeeks(row.skippedWeeks),
    createdAt: toIso(row.createdAt),
  };
}

/** Map subject ORM row → DTO. */
export function mapSubject(row: {
  id: string;
  semesterId: string;
  courseCode: string;
  courseCodeNorm: string;
  title: string;
  units: unknown;
  prerequisite: string | null;
  effectivity: string | null;
  grading: unknown;
  policies: unknown;
  faculty: unknown;
  archivedAt: unknown;
  createdAt: unknown;
}): SubjectDto {
  return {
    id: row.id,
    semesterId: row.semesterId,
    courseCode: row.courseCode,
    courseCodeNorm: row.courseCodeNorm,
    title: row.title,
    units: String(row.units),
    prerequisite: row.prerequisite,
    effectivity: row.effectivity,
    grading: row.grading ?? null,
    policies: row.policies ?? null,
    faculty: row.faculty ?? null,
    archivedAt: row.archivedAt ? toIso(row.archivedAt) : null,
    createdAt: toIso(row.createdAt),
  };
}

/** Map outcome ORM row → DTO. */
export function mapOutcome(row: {
  id: string;
  subjectId: string;
  kind: unknown;
  code: string;
  description: string;
  position: number;
}): OutcomeDto {
  const kind = String(row.kind) as OutcomeKindDto;
  return {
    id: row.id,
    subjectId: row.subjectId,
    kind,
    code: row.code,
    description: row.description,
    position: row.position,
  };
}

const PLAN_WEEK_STATUSES: PlanWeekStatusDto[] = [
  "Not started",
  "In progress",
  "Done",
  "No class",
];

/** Normalize stored status string → PlanWeekStatusDto. */
export function normalizePlanWeekStatus(
  value: string | null | undefined,
): PlanWeekStatusDto {
  if (value && PLAN_WEEK_STATUSES.includes(value as PlanWeekStatusDto)) {
    return value as PlanWeekStatusDto;
  }
  return "Not started";
}

/** Map plan week ORM row → DTO. */
export function mapPlanWeek(row: {
  id: string;
  subjectId: string;
  weekNumber: number;
  position?: number | null;
  topic: string | null;
  outcome?: string | null;
  activities?: string | null;
  status?: string | null;
  notes: string | null;
}): PlanWeekDto {
  return {
    id: row.id,
    subjectId: row.subjectId,
    weekNumber: row.weekNumber,
    position: row.position ?? 0,
    topic: row.topic,
    outcome: row.outcome ?? null,
    activities: row.activities ?? null,
    status: normalizePlanWeekStatus(row.status),
    notes: row.notes,
  };
}

/** Map assessment ORM row → DTO. */
export function mapAssessment(row: {
  id: string;
  subjectId: string;
  label: string;
  maxScore: unknown;
  position: number;
}): AssessmentDto {
  return {
    id: row.id,
    subjectId: row.subjectId,
    label: row.label,
    maxScore: String(row.maxScore),
    position: row.position,
  };
}

/** Map checklist ORM row → DTO. */
export function mapChecklistItem(row: {
  id: string;
  subjectId: string;
  weekNumber: number;
  done: boolean;
}): ChecklistItemDto {
  return {
    id: row.id,
    subjectId: row.subjectId,
    weekNumber: row.weekNumber,
    done: row.done,
  };
}
