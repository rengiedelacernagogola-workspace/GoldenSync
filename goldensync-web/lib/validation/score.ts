// WHAT: Validate batch score save array with per-row version.
// HOW: scoreItemSchema per assessmentId + score + version.
// SCREEN: Scores grid save.
// EDIT: Version field required for optimistic locking.
// KEEP: Match services/scores.ts upsert contract.
// RISK: Medium — invalid scores affect grade engine.

/**
 * Zod schemas — batch score upsert with optimistic versions (§7.5).
 */

import { z } from "zod";

export const scoreItemSchema = z.object({
  assessmentId: z.string().min(1),
  /** null = create path; number = expected current version. */
  version: z.number().int().min(1).nullable(),
  score: z.union([
    z.number().min(0).max(10_000),
    z.string().regex(/^\d+(\.\d{1,2})?$/),
    z.null(),
  ]),
  max: z.union([
    z.number().positive().max(10_000),
    z.string().regex(/^\d+(\.\d{1,2})?$/),
  ]),
});

export const batchScoresSchema = z.object({
  items: z.array(scoreItemSchema).min(1).max(150),
});

export type BatchScoresInput = z.infer<typeof batchScoresSchema>;
export type ScoreItemInput = z.infer<typeof scoreItemSchema>;
