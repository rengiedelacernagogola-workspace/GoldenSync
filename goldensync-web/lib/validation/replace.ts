// WHAT: Validate replace-subject body (new code, title, policies, etc.).
// HOW: replaceSubjectSchema mirrors create fields without semesterId.
// SCREEN: Replace subject wizard.
// EDIT: Keep in sync with subject create schema.
// KEEP: Course code confirmation may be separate route — check API.
// RISK: Medium — replace is destructive.

/**
 * Zod schemas — subject replace body (same fields as create minus semesterId).
 */

import { z } from "zod";

export const replaceSubjectSchema = z.object({
  courseCode: z.string().trim().min(1).max(32),
  title: z.string().trim().min(1).max(200),
  units: z.union([
    z.number().positive().max(30),
    z.string().regex(/^\d+(\.\d{1,2})?$/),
  ]),
  prerequisite: z.string().trim().max(200).nullable().optional(),
  effectivity: z.string().trim().max(120).nullable().optional(),
});

export type ReplaceSubjectInput = z.infer<typeof replaceSubjectSchema>;
