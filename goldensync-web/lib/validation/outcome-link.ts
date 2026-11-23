/**
 * Zod schemas — CO→PO OutcomeLink map (I/E/D).
 */

import { z } from "zod";

export const linkLevelSchema = z.enum(["I", "E", "D"]);

export const replaceOutcomeLinksSchema = z.object({
  links: z
    .array(
      z.object({
        coId: z.string().min(1),
        poId: z.string().min(1),
        level: linkLevelSchema,
      }),
    )
    .max(500),
});

export type ReplaceOutcomeLinksInput = z.infer<
  typeof replaceOutcomeLinksSchema
>;
