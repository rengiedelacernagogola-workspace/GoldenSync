// WHAT: Live calculator math — CO groups, weighted tasks, overall % and letter band.
// HOW: PURE; reads GradingTemplateDoc + score strings; uses grade-scale bands.
// SCREEN: Grade Calculator panel and estimated grade cards.
// EDIT: Status rules (PASSED/CONDITIONAL/FAILED) and task weight formulas here.
// KEEP: No API calls — merge template + localStorage in UI/services.
// RISK: Low code risk; High product risk if weighting rules drift from syllabus.

/**
 * Live Grade Calculator — CO-weighted averages, status rules, numerical lookup.
 * PURE: no I/O. Structure comes from GradingTemplateDoc; scores are local.
 */

import {
  DETAILED_GRADE_BANDS,
  lookupDetailedGrade,
} from "@/lib/domain/grade-scale";
import {
  coWeightTotal,
  type CoAssessmentGroup,
  type GradingTemplateDoc,
} from "@/lib/domain/grading-template";

export type CoPassStatus = "PASSED" | "FAILED";

export type OverallStatusKind =
  | "PASSED"
  | "CONDITIONAL"
  | "FAILED"
  | "EMPTY";

export type ScoredTaskInput = {
  taskId: string;
  task: string;
  weightPercent: number;
  maxScore: number;
  /** Empty string → treated as 0. */
  yourScore: string;
};

export type CoScoreResult = {
  groupId: string;
  code: string;
  coWeightPercent: number;
  average: number;
  status: CoPassStatus;
  contribution: number;
  tasks: Array<{
    taskId: string;
    task: string;
    weightPercent: number;
    maxScore: number;
    yourScore: number;
    yourScoreRaw: string;
    weightedScore: number;
    overMax: boolean;
  }>;
};

export type GradeStatusResult = {
  kind: OverallStatusKind;
  label: string;
  message: string;
  showNumerical: boolean;
  forceNumerical?: string;
  forceLetter?: string;
};

export type CalculatorSnapshot = {
  cos: CoScoreResult[];
  finalAverage: number;
  passedCount: number;
  failedCount: number;
  anyScoreEntered: boolean;
  status: GradeStatusResult;
  grade: ReturnType<typeof lookupNumericalGrade> | null;
};

/** Re-export shared bands for UI lookup table. */
export const NUMERICAL_GRADE_BANDS = DETAILED_GRADE_BANDS;

/** Parse "30%" / "16.67" → number. */
export function parsePercent(raw: string): number {
  const match = raw.replace(/,/g, "").match(/-?\d+(\.\d+)?/);
  if (!match) return 0;
  const n = Number(match[0]);
  return Number.isFinite(n) ? n : 0;
}

export function formatPct(n: number, digits = 2): string {
  if (!Number.isFinite(n)) return "0.00";
  return n.toFixed(digits);
}

/**
 * Weighted score within a CO:
 * (Your / Max) × 100 × (Weight / 100)
 */
export function weightedScore(
  yourScore: number,
  maxScore: number,
  weightPercent: number,
): number {
  if (!(maxScore > 0) || !Number.isFinite(yourScore) || !Number.isFinite(weightPercent)) {
    return 0;
  }
  const capped = Math.max(0, yourScore);
  return (capped / maxScore) * 100 * (weightPercent / 100);
}

export function coStatus(average: number): CoPassStatus {
  return average >= 60 ? "PASSED" : "FAILED";
}

export function lookupNumericalGrade(avg: number): {
  numerical: string;
  letter: string;
  description: string;
  bandIndex: number;
} {
  const hit = lookupDetailedGrade(Number.isFinite(avg) ? avg : 0);
  return {
    numerical: hit.numerical,
    letter: hit.letter,
    description: hit.description,
    bandIndex: hit.bandIndex,
  };
}

/**
 * Rules 1–4 in order (Section 3B).
 */
export function resolveGradeStatus(
  finalAverage: number,
  statuses: CoPassStatus[],
  anyScoreEntered: boolean,
): GradeStatusResult {
  if (!anyScoreEntered) {
    return {
      kind: "EMPTY",
      label: "No scores yet",
      message: "Enter scores below to see your projected grade.",
      showNumerical: false,
    };
  }

  const failedCount = statuses.filter((s) => s === "FAILED").length;
  const allPassed = failedCount === 0;
  const coCount = Math.max(1, statuses.length);
  const half = coCount / 2;

  if (allPassed && finalAverage >= 60) {
    return {
      kind: "PASSED",
      label: "PASSED",
      message:
        "All course outcomes are attained. Refer to the numerical grade below.",
      showNumerical: true,
    };
  }

  if (finalAverage > 60 && failedCount >= 1) {
    return {
      kind: "CONDITIONAL",
      label: "CONDITIONAL — Intervention Required",
      message:
        "You passed overall but failed at least one CO. Instructor may require removal exam or additional assessment. Your final grade is based on the original average.",
      showNumerical: true,
    };
  }

  if (finalAverage < 60 && failedCount <= half) {
    return {
      kind: "CONDITIONAL",
      label: "CONDITIONAL — Intervention Required",
      message:
        "Your average is below 60% but you passed more than half of the COs. Instructor may require removal exam. Maximum grade achievable after intervention: 3.0 (D).",
      showNumerical: true,
      forceNumerical: "3.0",
      forceLetter: "D",
    };
  }

  if (finalAverage < 60 && failedCount > half) {
    return {
      kind: "FAILED",
      label: "FAILED — 5.0 (E)",
      message:
        "You did not meet the minimum requirements. More than 50% of course outcomes were not attained.",
      showNumerical: true,
      forceNumerical: "5.0",
      forceLetter: "E",
    };
  }

  /* Edge: finalAverage === 60 with some fails → treat as conditional like rule 2 spirit */
  if (finalAverage >= 60 && failedCount >= 1) {
    return {
      kind: "CONDITIONAL",
      label: "CONDITIONAL — Intervention Required",
      message:
        "You passed overall but failed at least one CO. Instructor may require removal exam or additional assessment. Your final grade is based on the original average.",
      showNumerical: true,
    };
  }

  return {
    kind: "PASSED",
    label: "PASSED",
    message:
      "All course outcomes are attained. Refer to the numerical grade below.",
    showNumerical: true,
  };
}

export function courseStatusSentence(snapshot: CalculatorSnapshot): string {
  if (!snapshot.anyScoreEntered) {
    return "Enter scores to see course status.";
  }
  const failed = snapshot.cos.filter((c) => c.status === "FAILED");
  if (failed.length === 0 && snapshot.grade) {
    return `All COs passed. You are eligible for a final grade of ${snapshot.grade.numerical} (${snapshot.grade.letter}).`;
  }
  if (failed.length > 0) {
    const codes = failed.map((c) => c.code).join(" and ");
    return `${codes} failed. Instructor intervention required.`;
  }
  return snapshot.status.message;
}

type ScoreMaps = {
  yourScores: Record<string, string>;
  maxScores: Record<string, string>;
};

function parseYour(raw: string): number {
  if (raw.trim() === "") return 0;
  const n = Number(raw);
  return Number.isFinite(n) ? n : 0;
}

function parseMax(raw: string): number {
  if (raw.trim() === "") return 100;
  const n = Number(raw);
  return Number.isFinite(n) && n > 0 ? n : 100;
}

/** Compute full calculator snapshot from template + score maps. */
export function computeCalculatorSnapshot(
  template: GradingTemplateDoc,
  scores: ScoreMaps,
): CalculatorSnapshot {
  const cos: CoScoreResult[] = template.coGroups.map((group) =>
    computeCoResult(group, scores),
  );

  let anyScoreEntered = false;
  for (const co of cos) {
    for (const t of co.tasks) {
      if (t.yourScoreRaw.trim() !== "") {
        anyScoreEntered = true;
        break;
      }
    }
    if (anyScoreEntered) break;
  }

  const finalAverage = cos.reduce((sum, c) => sum + c.contribution, 0);
  const passedCount = cos.filter((c) => c.status === "PASSED").length;
  const failedCount = cos.length - passedCount;
  const status = resolveGradeStatus(
    finalAverage,
    cos.map((c) => c.status),
    anyScoreEntered,
  );

  let grade: ReturnType<typeof lookupNumericalGrade> | null = null;
  if (anyScoreEntered && status.showNumerical) {
    if (status.forceNumerical && status.forceLetter) {
      const target = Number(status.forceNumerical);
      const bandIndex = NUMERICAL_GRADE_BANDS.findIndex(
        (b) => b.grade === target,
      );
      const fallback = bandIndex >= 0 ? bandIndex : NUMERICAL_GRADE_BANDS.length - 1;
      grade = {
        numerical: status.forceNumerical,
        letter: status.forceLetter,
        description: NUMERICAL_GRADE_BANDS[fallback]?.description ?? "",
        bandIndex: fallback,
      };
    } else if (status.kind === "FAILED") {
      grade = lookupNumericalGrade(0);
    } else {
      grade = lookupNumericalGrade(finalAverage);
    }
  }

  return {
    cos,
    finalAverage,
    passedCount,
    failedCount,
    anyScoreEntered,
    status,
    grade,
  };
}

function computeCoResult(
  group: CoAssessmentGroup,
  scores: ScoreMaps,
): CoScoreResult {
  const coWeightPercent = parsePercent(group.weightPercent);
  const tasks = group.tasks.map((task) => {
    const yourScoreRaw = scores.yourScores[task.id] ?? "";
    const maxRaw = scores.maxScores[task.id] ?? "100";
    const maxScore = parseMax(maxRaw);
    const yourScore = parseYour(yourScoreRaw);
    const weightPercent = parsePercent(task.weight);
    const overMax = yourScoreRaw.trim() !== "" && yourScore > maxScore;
    const effectiveYour = overMax ? maxScore : yourScore;
    return {
      taskId: task.id,
      task: task.task,
      weightPercent,
      maxScore,
      yourScore: effectiveYour,
      yourScoreRaw,
      weightedScore: weightedScore(effectiveYour, maxScore, weightPercent),
      overMax,
    };
  });

  const average = tasks.reduce((sum, t) => sum + t.weightedScore, 0);
  const status = coStatus(average);
  const contribution = average * (coWeightPercent / 100);

  return {
    groupId: group.id,
    code: group.code,
    coWeightPercent,
    average,
    status,
    contribution,
    tasks,
  };
}

/** Default max scores map for all tasks in a template. */
export function defaultMaxScores(
  template: GradingTemplateDoc,
): Record<string, string> {
  const out: Record<string, string> = {};
  for (const g of template.coGroups) {
    for (const t of g.tasks) {
      out[t.id] = "100";
    }
  }
  return out;
}

export function emptyYourScores(
  template: GradingTemplateDoc,
): Record<string, string> {
  const out: Record<string, string> = {};
  for (const g of template.coGroups) {
    for (const t of g.tasks) {
      out[t.id] = "";
    }
  }
  return out;
}

/** Sanity: template CO weights should sum ~100 (reuse helper). */
export function templateCoWeightSum(template: GradingTemplateDoc): number {
  return coWeightTotal(template.coGroups);
}
