/**
 * Per-subject estimated grade for dashboard cards.
 * Combines Subject.grading template + localStorage calculator scores.
 */

import {
  loadCalculatorScores,
  mergeScoresOntoTemplate,
  templateTaskIds,
} from "@/lib/domain/calculator-scores-storage";
import {
  computeCalculatorSnapshot,
  defaultMaxScores,
  emptyYourScores,
  formatPct,
} from "@/lib/domain/co-grade-calculator";
import {
  DEFAULT_GRADING_TEMPLATE,
  tryParseGradingTemplate,
  type GradingTemplateDoc,
} from "@/lib/domain/grading-template";

export type EstimatedSubjectGrade = {
  percent: number;
  percentLabel: string;
  scaleLabel: string | null;
  hasScores: boolean;
};

function clampPercent(n: number): number {
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.min(100, n));
}

/** Resolve template from subject grading JSON (or default when allowDefault). */
export function resolveGradingTemplate(
  gradingRaw: unknown,
  allowDefault = false,
): GradingTemplateDoc | null {
  const parsed = tryParseGradingTemplate(gradingRaw);
  if (parsed) return parsed;
  if (allowDefault) return DEFAULT_GRADING_TEMPLATE;
  return null;
}

/**
 * Build estimated grade for a subject card from grading + saved scores.
 * Returns null when there is no usable grading template.
 */
export function estimateSubjectGrade(
  subjectId: string,
  gradingRaw: unknown,
  options?: { allowDefaultTemplate?: boolean },
): EstimatedSubjectGrade | null {
  const template = resolveGradingTemplate(
    gradingRaw,
    Boolean(options?.allowDefaultTemplate),
  );
  if (!template) return null;

  const empty = emptyYourScores(template);
  const defaults = defaultMaxScores(template);
  const saved = loadCalculatorScores(subjectId);
  const { yourScores, maxScores } = mergeScoresOntoTemplate(
    templateTaskIds(template),
    empty,
    defaults,
    saved,
  );
  const snapshot = computeCalculatorSnapshot(template, {
    yourScores,
    maxScores,
  });
  const percent = clampPercent(snapshot.finalAverage);
  return {
    percent,
    percentLabel: snapshot.anyScoreEntered ? `${formatPct(percent)}%` : "—",
    scaleLabel:
      snapshot.anyScoreEntered && snapshot.grade
        ? `${snapshot.grade.numerical} (${snapshot.grade.letter})`
        : null,
    hasScores: snapshot.anyScoreEntered,
  };
}
