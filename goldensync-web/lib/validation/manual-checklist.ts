/**
 * Zod schemas — manual checklist (never feeds Calculator / I14).
 */

import { z } from "zod";

export const createManualChecklistSchema = z.object({
  title: z.string().trim().min(1).max(200),
  detail: z.string().trim().max(2000).default(""),
});

export const updateManualChecklistSchema = z
  .object({
    title: z.string().trim().min(1).max(200).optional(),
    detail: z.string().trim().max(2000).optional(),
    done: z.boolean().optional(),
    position: z.number().int().min(0).max(10_000).optional(),
  })
  .refine(
    (v) =>
      v.title !== undefined ||
      v.detail !== undefined ||
      v.done !== undefined ||
      v.position !== undefined,
    { message: "At least one field is required." },
  );

export type CreateManualChecklistInput = z.infer<
  typeof createManualChecklistSchema
>;
export type UpdateManualChecklistInput = z.infer<
  typeof updateManualChecklistSchema
>;
