/**
 * Zod schemas — draft autosave.
 */

import { z } from "zod";

export const draftKindSchema = z
  .string()
  .trim()
  .min(1)
  .max(64)
  .regex(/^[a-z0-9_-]+$/i);

export const putDraftSchema = z.object({
  payload: z.unknown(),
});

export type PutDraftInput = z.infer<typeof putDraftSchema>;
