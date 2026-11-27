// WHAT: Validate full outcomes replace list (PEO/PO/CO).
// HOW: outcomeKindSchema + code/description per row.
// SCREEN: Outcomes save.
// EDIT: Array size limits if added.
// KEEP: Kind enum must match DB enum.
// RISK: Low.

/**
 * Zod schemas — outcome replace set (Phase 1).
 */

import { z } from "zod";

export const outcomeKindSchema = z.enum(["PEO", "PO", "CO"]);

export const outcomeItemSchema = z.object({
  kind: outcomeKindSchema,
  code: z.string().trim().min(1).max(32),
  description: z.string().trim().min(1).max(500),
  position: z.number().int().min(0).max(99),
});

/** Full replace of outcomes on a subject (max MAX_OUTCOMES). */
export const replaceOutcomesSchema = z.object({
  outcomes: z.array(outcomeItemSchema).max(20),
});

export type ReplaceOutcomesInput = z.infer<typeof replaceOutcomesSchema>;
export type OutcomeItemInput = z.infer<typeof outcomeItemSchema>;
