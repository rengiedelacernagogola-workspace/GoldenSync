/**
 * Zod schemas — activity (Assessment) create / patch.
 */

import { z } from "zod";

const maxScoreInput = z.union([
  z.number().positive().max(10_000),
  z.string().regex(/^\d+(\.\d{1,2})?$/),
]);

export const createAssessmentSchema = z.object({
  label: z.string().trim().min(1).max(120),
  maxScore: maxScoreInput,
  position: z.number().int().min(0).max(999).optional(),
  /** Outcome ids on this subject to map the activity (D2 points-weighted). */
  outcomeIds: z.array(z.string().min(1)).max(20).default([]),
});

export const patchAssessmentSchema = z
  .object({
    label: z.string().trim().min(1).max(120).optional(),
    maxScore: maxScoreInput.optional(),
    position: z.number().int().min(0).max(999).optional(),
    outcomeIds: z.array(z.string().min(1)).max(20).optional(),
  })
  .refine((v) => Object.keys(v).length > 0, {
    message: "At least one field is required.",
  });

export type CreateAssessmentInput = z.infer<typeof createAssessmentSchema>;
export type PatchAssessmentInput = z.infer<typeof patchAssessmentSchema>;
