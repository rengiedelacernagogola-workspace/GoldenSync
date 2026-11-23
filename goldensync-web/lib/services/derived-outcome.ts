import "server-only";

/**
 * Derived outcome result for a subject (architecture §10.1 / Appendix B).
 * Grade scale gate (§10.3): hide numeric grade for PASSED / INTERVENTION_A
 * unless GradeScaleMeta.confirmed; map average when confirmed.
 */

import { computeGrade } from "@/lib/domain/grade-engine";
import {
  GradeScaleConfigError,
  mapAverageToGrade,
} from "@/lib/domain/grade-scale";
import { db } from "@/lib/db";
import { requireOwnedSubject } from "@/lib/db/ownership-guards";
import { AppError } from "@/lib/http/errors";
import {
  isGradeScaleConfirmed,
  listGradeScaleBands,
} from "@/lib/queries/grade-scale";

export type DerivedOutcomeDto = {
  status: string;
  average: number | null;
  outcomes: {
    outcomeId: string;
    code: string;
    percent: number | null;
    attained: boolean;
    scored: boolean;
  }[];
  weakOutcomeIds: string[];
  /** Numeric grade when released or ungated status. */
  grade: number | null;
  suggestedGrade: number | null;
  gradeHidden: boolean;
};

/** Build grade-engine input from owned subject graph. */
export async function getDerivedOutcome(
  userId: string,
  subjectId: string,
): Promise<DerivedOutcomeDto> {
  await requireOwnedSubject(userId, subjectId);

  const outcomes = await db.orm.public.Outcome.where({ subjectId }).all();
  const cos = outcomes
    .filter((o) => String(o.kind) === "CO")
    .sort((a, b) => a.position - b.position);

  const assessments = await db.orm.public.Assessment.where({ subjectId }).all();

  const linksByOutcome = new Map<string, { score: number; max: number }[]>();
  for (const co of cos) linksByOutcome.set(co.id, []);

  for (const assessment of assessments) {
    const scoreRow = await db.orm.public.Score.where({
      assessmentId: assessment.id,
    }).first();
    if (!scoreRow || scoreRow.score == null) continue;

    const links = await db.orm.public.AssessmentOutcome.where({
      assessmentId: assessment.id,
    }).all();

    const activity = {
      score: Number(scoreRow.score),
      max: Number(scoreRow.max),
    };
    for (const link of links) {
      const bucket = linksByOutcome.get(link.outcomeId);
      if (bucket) bucket.push(activity);
    }
  }

  const engineInput = cos.map((co) => ({
    outcomeId: co.id,
    activities: linksByOutcome.get(co.id) ?? [],
  }));

  const result = computeGrade(engineInput);
  const codeById = new Map(cos.map((c) => [c.id, c.code]));

  const gated =
    result.status === "PASSED" || result.status === "INTERVENTION_A";
  const confirmed = await isGradeScaleConfirmed();

  let grade: number | null = null;
  let gradeHidden = false;
  let suggestedGrade = result.suggestedGrade;

  if (result.status === "INTERVENTION_B" || result.status === "FAILED") {
    grade = result.suggestedGrade;
    gradeHidden = false;
  } else if (gated) {
    if (!confirmed || result.average == null) {
      gradeHidden = true;
      grade = null;
      suggestedGrade = null;
    } else {
      try {
        const bands = await listGradeScaleBands();
        grade = mapAverageToGrade(result.average, bands);
        gradeHidden = false;
        suggestedGrade = grade;
      } catch (err) {
        if (err instanceof GradeScaleConfigError) {
          throw new AppError("CONFIG_ERROR", err.message);
        }
        throw err;
      }
    }
  }

  return {
    status: result.status,
    average: result.average,
    outcomes: result.outcomes.map((o) => ({
      outcomeId: o.outcomeId,
      code: codeById.get(o.outcomeId) ?? o.outcomeId,
      percent: o.percent,
      attained: o.attained,
      scored: o.scored,
    })),
    weakOutcomeIds: result.weakOutcomeIds,
    grade,
    suggestedGrade,
    gradeHidden,
  };
}
