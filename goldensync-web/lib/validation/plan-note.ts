// WHAT: Validate create/update/delete bodies for plan notes.
// HOW: Zod title/content length limits.
// SCREEN: /notes composer and library.
// EDIT: Max title/content lengths.
// KEEP: Pair with services/plan-notes.ts pin rules.
// RISK: Low.

/**
 * Zod schemas — plan notes (All notes library).
 */

import { z } from "zod";

export const createPlanNoteSchema = z.object({
  title: z.string().trim().min(1).max(200),
  topic: z.string().trim().max(200).default(""),
  body: z.string().trim().min(1).max(20_000),
  importance: z.number().int().min(1).max(3).optional(),
  pinned: z.boolean().optional(),
});

export const updatePlanNoteSchema = z
  .object({
    title: z.string().trim().min(1).max(200).optional(),
    topic: z.string().trim().max(200).optional(),
    body: z.string().trim().min(1).max(20_000).optional(),
    importance: z.number().int().min(1).max(3).optional(),
    pinned: z.boolean().optional(),
    archived: z.boolean().optional(),
    deleted: z.boolean().optional(),
  })
  .refine(
    (v) =>
      v.title !== undefined ||
      v.topic !== undefined ||
      v.body !== undefined ||
      v.importance !== undefined ||
      v.pinned !== undefined ||
      v.archived !== undefined ||
      v.deleted !== undefined,
    { message: "At least one field is required." },
  );

export type CreatePlanNoteInput = z.infer<typeof createPlanNoteSchema>;
export type UpdatePlanNoteInput = z.infer<typeof updatePlanNoteSchema>;
