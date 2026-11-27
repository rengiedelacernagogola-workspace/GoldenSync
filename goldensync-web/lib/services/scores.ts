import "server-only";

// WHAT: Save many assessment scores in one request with version checks.
// HOW: requireOwnedAssessment per row; maxScore decimal strings via domain/units.
// SCREEN: Scores grid / batch save on subject.
// EDIT: Conflict error handling when version mismatches.
// KEEP: Optimistic concurrency — clients must send versions.
// RISK: High — database; grade integrity depends on this.

/**
 * Batch score upsert with optimistic concurrency (architecture §7.5).
 */

import { maxScoreToDecimalString } from "@/lib/domain/units";
import { db } from "@/lib/db";
import { requireOwnedSubject } from "@/lib/db/ownership-guards";
import { AppError, notFound } from "@/lib/http/errors";
import type { BatchScoresInput } from "@/lib/validation/score";

export type ScoreDto = {
  assessmentId: string;
  score: string | null;
  max: string;
  version: number;
};

function scoreToString(value: number | string | null): string | null {
  if (value === null) return null;
  return maxScoreToDecimalString(value);
}

/** Upsert scores for assessments owned under subjectId. */
export async function upsertScores(
  userId: string,
  subjectId: string,
  input: BatchScoresInput,
): Promise<ScoreDto[]> {
  await requireOwnedSubject(userId, subjectId);

  const ids = input.items.map((i) => i.assessmentId);
  const owned = await db.orm.public.Assessment.where({ subjectId }).all();
  const ownedIds = new Set(owned.map((a) => a.id));
  if (ids.some((id) => !ownedIds.has(id))) throw notFound();

  await db.transaction(async (tx) => {
    for (const it of input.items) {
      const maxStr = maxScoreToDecimalString(it.max);
      const scoreStr = scoreToString(it.score);

      if (it.version === null) {
        const existing = await tx.orm.public.Score.where({
          assessmentId: it.assessmentId,
        }).first();
        if (existing) {
          throw new AppError("CONFLICT_VERSION", "Score already exists.", {
            assessmentId: it.assessmentId,
          });
        }
        await tx.orm.public.Score.create({
          assessmentId: it.assessmentId,
          score: scoreStr,
          max: maxStr,
          version: 1,
        });
      } else {
        const current = await tx.orm.public.Score.where({
          assessmentId: it.assessmentId,
        }).first();
        if (!current || current.version !== it.version) {
          throw new AppError("CONFLICT_VERSION", "Score version conflict.", {
            assessmentId: it.assessmentId,
          });
        }
        await tx.orm.public.Score.where({ id: current.id }).update({
          score: scoreStr,
          max: maxStr,
          version: current.version + 1,
        });
      }
    }
  });

  const results: ScoreDto[] = [];
  for (const id of ids) {
    const row = await db.orm.public.Score.where({ assessmentId: id }).first();
    if (!row) throw notFound();
    results.push({
      assessmentId: id,
      score: row.score == null ? null : String(row.score),
      max: String(row.max),
      version: row.version,
    });
  }
  return results;
}
