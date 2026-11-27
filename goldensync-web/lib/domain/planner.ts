// WHAT: Decide “this week” state for a semester plan (before start, no class, topic, etc.).
// HOW: PURE date math on YYYY-MM-DD; caller passes todayISO — no new Date() inside core logic.
// SCREEN: Planner / This Week UI uses getWeekState output.
// EDIT: WeekStateKind rules and skipped-week handling in getWeekState.
// KEEP: UTC-noon parsing avoids DST surprises.
// RISK: Low.

/**
 * Planner week state (architecture §10.2) — PURE; todayISO injected by caller.
 * Contract PlanWeek uses weekNumber (single week); ranges collapse to equality.
 */

export type WeekStateKind =
  | "BEFORE_START"
  | "AFTER_END"
  | "NO_CLASS"
  | "NO_PLAN_FOR_WEEK"
  | "NORMAL";

export type PlannerSemester = {
  startDateISO: string; // YYYY-MM-DD
  endDateISO: string;
  skippedWeeks: number[];
};

export type PlannerPlanWeek = {
  weekNumber: number;
  topic: string | null;
};

export type WeekState = {
  kind: WeekStateKind;
  /** Calendar week number since semester start (1-based), when applicable. */
  weekNumber: number | null;
  /** Days until start when BEFORE_START. */
  daysUntilStart: number | null;
  topic: string | null;
  /** Next scheduled topic when NO_CLASS / preview. */
  nextTopic: string | null;
};

/** Parse YYYY-MM-DD as UTC noon to avoid DST edge noise. */
function parseDay(iso: string): number {
  const [y, m, d] = iso.split("-").map(Number);
  return Date.UTC(y!, m! - 1, d!);
}

/** Whole days between two YYYY-MM-DD dates (today - start). */
export function daysBetween(startISO: string, todayISO: string): number {
  const ms = parseDay(todayISO) - parseDay(startISO);
  return Math.floor(ms / 86_400_000);
}

/** Week number = floor(d / 7) + 1 where d is days since start. */
export function weekNumberFromStart(startISO: string, todayISO: string): number {
  const d = daysBetween(startISO, todayISO);
  return Math.floor(d / 7) + 1;
}

function topicForWeek(
  weeks: PlannerPlanWeek[],
  weekNumber: number,
): string | null {
  return weeks.find((w) => w.weekNumber === weekNumber)?.topic ?? null;
}

function nextScheduledTopic(
  weeks: PlannerPlanWeek[],
  afterWeek: number,
  skipped: Set<number>,
): string | null {
  const sorted = [...weeks].sort((a, b) => a.weekNumber - b.weekNumber);
  for (const w of sorted) {
    if (w.weekNumber > afterWeek && !skipped.has(w.weekNumber) && w.topic) {
      return w.topic;
    }
  }
  return null;
}

/**
 * Derive This Week state.
 * FLOW: before → after → skipped → missing plan → normal.
 */
export function getWeekState(
  todayISO: string,
  semester: PlannerSemester,
  planWeeks: PlannerPlanWeek[],
): WeekState {
  const d = daysBetween(semester.startDateISO, todayISO);
  const skipped = new Set(semester.skippedWeeks);

  if (d < 0) {
    return {
      kind: "BEFORE_START",
      weekNumber: null,
      daysUntilStart: -d,
      topic: topicForWeek(planWeeks, 1),
      nextTopic: topicForWeek(planWeeks, 1),
    };
  }

  if (todayISO > semester.endDateISO) {
    return {
      kind: "AFTER_END",
      weekNumber: null,
      daysUntilStart: null,
      topic: null,
      nextTopic: null,
    };
  }

  const weekNumber = weekNumberFromStart(semester.startDateISO, todayISO);

  if (skipped.has(weekNumber)) {
    return {
      kind: "NO_CLASS",
      weekNumber,
      daysUntilStart: null,
      topic: null,
      nextTopic: nextScheduledTopic(planWeeks, weekNumber, skipped),
    };
  }

  const plan = planWeeks.find((w) => w.weekNumber === weekNumber);
  if (!plan) {
    return {
      kind: "NO_PLAN_FOR_WEEK",
      weekNumber,
      daysUntilStart: null,
      topic: null,
      nextTopic: nextScheduledTopic(planWeeks, weekNumber, skipped),
    };
  }

  return {
    kind: "NORMAL",
    weekNumber,
    daysUntilStart: null,
    topic: plan.topic,
    nextTopic: null,
  };
}
