/**
 * Zod schemas — plan week replace set (editable Learning Plan).
 * Same weekNumber may appear many times (multiple topics in one week).
 */

import { z } from "zod";

import { limits } from "@/lib/config/limits";

export const planWeekStatusSchema = z.enum([
  "Not started",
  "In progress",
  "Done",
  "No class",
]);

export const planWeekItemSchema = z.object({
  weekNumber: z.number().int().min(1).max(limits.MAX_PLAN_WEEKS),
  position: z.number().int().min(0).max(limits.MAX_PLAN_ENTRIES).optional(),
  topic: z.string().trim().max(500).nullable().optional(),
  outcome: z.string().trim().max(200).nullable().optional(),
  activities: z.string().trim().max(500).nullable().optional(),
  status: planWeekStatusSchema.optional(),
  notes: z.string().trim().max(2000).nullable().optional(),
});

/** Full replace of plan rows (duplicate weekNumbers allowed). */
export const replacePlanSchema = z.object({
  weeks: z.array(planWeekItemSchema).max(limits.MAX_PLAN_ENTRIES),
});

export type ReplacePlanInput = z.infer<typeof replacePlanSchema>;
export type PlanWeekItemInput = z.infer<typeof planWeekItemSchema>;
export type PlanWeekStatusInput = z.infer<typeof planWeekStatusSchema>;
