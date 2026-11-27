// WHAT: Validate checklist toggle API body (week number, done flag).
// HOW: toggleChecklistSchema for POST handlers.
// SCREEN: Checklist UI week toggles.
// EDIT: weekNumber max (30) if semesters grow longer.
// KEEP: Must match checklist service toggle signature.
// RISK: Low.

/**
 * Zod schemas — checklist week toggle (architecture Appendix B).
 */

import { z } from "zod";

export const toggleChecklistSchema = z.object({
  weekNumber: z.number().int().min(1).max(30),
  done: z.boolean(),
  /** When set, only this PlanWeek row’s status is synced (multi-topic weeks). */
  planWeekId: z.string().min(1).optional(),
});

export type ToggleChecklistInput = z.infer<typeof toggleChecklistSchema>;
