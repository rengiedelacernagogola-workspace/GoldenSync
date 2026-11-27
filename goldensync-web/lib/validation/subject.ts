// WHAT: Validate subject create, patch, and delete-confirm payloads.
// HOW: Zod including nested plan week preview on create.
// SCREEN: Subject forms and delete confirmation modal.
// EDIT: Field max lengths and courseCode rules.
// KEEP: Align with lib/services/subjects.ts expectations.
// RISK: Medium — weak validation → corrupt subject rows.

/**
 * Zod schemas — subject create / patch / delete confirm.
 */

import { z } from "zod";

const createPlanWeekSchema = z.object({
  weekNumber: z.number().int().min(1).max(30),
  topic: z.string().trim().max(500).nullable().optional(),
});

const createOutcomeSchema = z.object({
  kind: z.enum(["PEO", "PO", "CO"]),
  code: z.string().trim().min(1).max(24),
  description: z.string().trim().max(500),
  position: z.number().int().min(0).max(500).optional(),
});

const createAssessmentSeedSchema = z.object({
  label: z.string().trim().min(1).max(120),
  maxScore: z
    .union([z.number().positive().max(1000), z.string().regex(/^\d+(\.\d{1,2})?$/)])
    .nullable()
    .optional(),
  position: z.number().int().min(0).max(500).optional(),
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
  /** Optional Sync-found JSON / child rows — omit when empty (manual create). */
  grading: z.unknown().optional(),
  policies: z.unknown().optional(),
  faculty: z.unknown().optional(),
  outcomes: z.array(createOutcomeSchema).max(150).optional(),
  assessments: z.array(createAssessmentSeedSchema).max(150).optional(),
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
