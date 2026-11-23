/**
 * Grade engine (architecture §10.1) — PURE Decimal-safe math, no I/O.
 * Threshold comparisons use scaled integers (basis points), never raw float ==.
 * Defaults mirror `lib/config/limits` (no path-alias imports — unit-testable).
 */

const DEFAULT_ATTAINMENT = 60;
const DEFAULT_INTERVENTION = 60;
const BEST_GRADE_INTERVENTION_B = 3.0;
const GRADE_FAILED = 5.0;

export type GradeStatus =
  | "PASSED"
  | "INTERVENTION_A"
  | "UNDEFINED_AT_THRESHOLD"
  | "INTERVENTION_B"
  | "FAILED"
  | "INCOMPLETE";

/** One scored activity mapped to an outcome (null scores omitted by caller). */
export type ScoredActivity = {
  score: number;
  max: number;
};

/** Per-outcome input: activities already filtered to scored rows. */
export type OutcomeScoreInput = {
  outcomeId: string;
  activities: ScoredActivity[];
};

export type OutcomeResult = {
  outcomeId: string;
  percent: number | null;
  attained: boolean;
  scored: boolean;
};

export type GradeEngineResult = {
  status: GradeStatus;
  average: number | null;
  outcomes: OutcomeResult[];
  weakOutcomeIds: string[];
  /** Suggested grade when status is INTERVENTION_B or FAILED (ungated). */
  suggestedGrade: number | null;
};

/** Scale factor for threshold compares (0.01% precision). */
const SCALE = 10_000;

/** Convert percent to integer basis points. */
function toBp(percent: number): number {
  return Math.round(percent * SCALE);
}

/** sum(score)/sum(max)*100 — unrounded Number for display/mean. */
export function outcomePercent(activities: ScoredActivity[]): number | null {
  if (activities.length === 0) return null;
  let scoreSum = 0;
  let maxSum = 0;
  for (const a of activities) {
    if (!(a.max > 0)) continue;
    scoreSum += a.score;
    maxSum += a.max;
  }
  if (maxSum <= 0) return null;
  return (scoreSum / maxSum) * 100;
}

/**
 * Compute subject result from per-outcome scored activities.
 * FLOW: percents → incomplete gate → average → ordered status rules.
 */
export function computeGrade(
  inputs: OutcomeScoreInput[],
  options?: {
    attainmentThreshold?: number;
    interventionThreshold?: number;
  },
): GradeEngineResult {
  const attainment = options?.attainmentThreshold ?? DEFAULT_ATTAINMENT;
  const intervention =
    options?.interventionThreshold ?? DEFAULT_INTERVENTION;

  const outcomes: OutcomeResult[] = inputs.map((o) => {
    const percent = outcomePercent(o.activities);
    const scored = percent !== null;
    return {
      outcomeId: o.outcomeId,
      percent,
      scored,
      attained: scored && percent! > attainment,
    };
  });

  if (outcomes.some((o) => !o.scored)) {
    return {
      status: "INCOMPLETE",
      average: null,
      outcomes,
      weakOutcomeIds: [],
      suggestedGrade: null,
    };
  }

  const n = outcomes.length;
  if (n === 0) {
    return {
      status: "INCOMPLETE",
      average: null,
      outcomes,
      weakOutcomeIds: [],
      suggestedGrade: null,
    };
  }

  const average =
    outcomes.reduce((acc, o) => acc + (o.percent as number), 0) / n;
  const averageBp = toBp(average);
  const thresholdBp = toBp(intervention);
  const allAttained = outcomes.every((o) => o.attained);
  const attainedCount = outcomes.filter((o) => o.attained).length;
  const weakOutcomeIds = outcomes
    .filter((o) => !o.attained)
    .map((o) => o.outcomeId);

  let status: GradeStatus;
  let suggestedGrade: number | null = null;

  if (allAttained) {
    status = "PASSED";
  } else if (averageBp > thresholdBp) {
    status = "INTERVENTION_A";
  } else if (averageBp === thresholdBp) {
    status = "UNDEFINED_AT_THRESHOLD";
  } else if (attainedCount >= n / 2) {
    status = "INTERVENTION_B";
    suggestedGrade = BEST_GRADE_INTERVENTION_B;
  } else {
    status = "FAILED";
    suggestedGrade = GRADE_FAILED;
  }

  return {
    status,
    average,
    outcomes,
    weakOutcomeIds,
    suggestedGrade,
  };
}
