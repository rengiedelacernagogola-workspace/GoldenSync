/**
 * Zod schemas — subject create / patch / delete confirm.
 */

import { z } from "zod";

const createPlanWeekSchema = z.object({
  weekNumber: z.number().int().min(1).max(30),
  topic: z.string().trim().max(500).nullable().optional(),
});

export const createSubjectSchema = z.object({
  semesterId: z.string().min(1),
  courseCode: z.string().trim().min(1).max(32),
  title: z.string().trim().min(1).max(200),
  units: z.union([z.number().positive().max(30), z.string().regex(/^\d+(\.\d{1,2})?$/)]),
  prerequisite: z.string().trim().max(200).nullable().optional(),
  effectivity: z.string().trim().max(120).nullable().optional(),
  /** Optional syllabus-extracted weeks; always merged onto a semester skeleton. */
  planWeeks: z.array(createPlanWeekSchema).max(30).optional(),
});

export const patchSubjectSchema = z
  .object({
    courseCode: z.string().trim().min(1).max(32).optional(),
    title: z.string().trim().min(1).max(200).optional(),
    units: z
      .union([z.number().positive().max(30), z.string().regex(/^\d+(\.\d{1,2})?$/)])
      .optional(),
    prerequisite: z.string().trim().max(200).nullable().optional(),
    effectivity: z.string().trim().max(120).nullable().optional(),
    grading: z.unknown().optional(),
    policies: z.unknown().optional(),
    faculty: z.unknown().optional(),
  })
  .refine((v) => Object.keys(v).length > 0, {
    message: "At least one field is required.",
  });

export const deleteSubjectSchema = z.object({
  confirmCourseCode: z.string().trim().min(1),
});

export type CreateSubjectInput = z.infer<typeof createSubjectSchema>;
export type PatchSubjectInput = z.infer<typeof patchSubjectSchema>;
export type DeleteSubjectInput = z.infer<typeof deleteSubjectSchema>;
