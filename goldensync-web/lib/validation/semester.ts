// WHAT: Request body rules for creating/updating semesters.
// HOW: Zod schemas consumed by API routes before services/semesters.ts.
// EDIT: Date string formats and year level bounds here.
// KEEP: Mirror domain semester-dates validation intent.
// RISK: Medium — bad schema lets invalid dates hit DB.

/**
 * Zod schemas — semester create / patch.
 */

import { z } from "zod";

import {
  YEAR_LEVEL_MAX,
  YEAR_LEVEL_MIN,
} from "@/lib/domain/semester-year";

const dateInput = z.union([z.string().datetime(), z.string().date()]);

const yearLevelSchema = z.number().int().min(YEAR_LEVEL_MIN).max(YEAR_LEVEL_MAX);

export const createSemesterSchema = z.object({
  label: z.string().trim().min(1).max(80),
  yearLevel: yearLevelSchema,
  startDate: dateInput,
  endDate: dateInput,
  skippedWeeks: z.array(z.number().int().min(1).max(30)).default([]),
});

export const patchSemesterSchema = z
  .object({
    label: z.string().trim().min(1).max(80).optional(),
    yearLevel: yearLevelSchema.optional(),
    startDate: dateInput.optional(),
    endDate: dateInput.optional(),
    skippedWeeks: z.array(z.number().int().min(1).max(30)).optional(),
  })
  .refine((v) => Object.keys(v).length > 0, {
    message: "At least one field is required.",
  });

export type CreateSemesterInput = z.infer<typeof createSemesterSchema>;
export type PatchSemesterInput = z.infer<typeof patchSemesterSchema>;
