/**
 * Zod schemas — semester create / patch.
 */

import { z } from "zod";

const dateInput = z.union([z.string().datetime(), z.string().date()]);

export const createSemesterSchema = z.object({
  label: z.string().trim().min(1).max(80),
  startDate: dateInput,
  endDate: dateInput,
  skippedWeeks: z.array(z.number().int().min(1).max(30)).default([]),
});

export const patchSemesterSchema = z
  .object({
    label: z.string().trim().min(1).max(80).optional(),
    startDate: dateInput.optional(),
    endDate: dateInput.optional(),
    skippedWeeks: z.array(z.number().int().min(1).max(30)).optional(),
  })
  .refine((v) => Object.keys(v).length > 0, {
    message: "At least one field is required.",
  });

export type CreateSemesterInput = z.infer<typeof createSemesterSchema>;
export type PatchSemesterInput = z.infer<typeof patchSemesterSchema>;
