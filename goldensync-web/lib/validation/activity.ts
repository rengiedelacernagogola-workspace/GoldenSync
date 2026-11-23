/**
 * Zod schemas — activity / notifications feed.
 */

import { z } from "zod";

export const activityKindSchema = z.enum([
  "subject",
  "notes",
  "semester",
  "account",
  "system",
]);

export const createActivitySchema = z.object({
  kind: activityKindSchema,
  title: z.string().trim().min(1).max(200),
  detail: z.string().trim().min(1).max(2000),
  entity: z.string().trim().max(80).optional(),
  entityId: z.string().trim().max(64).optional(),
});

export type CreateActivityInput = z.infer<typeof createActivitySchema>;
