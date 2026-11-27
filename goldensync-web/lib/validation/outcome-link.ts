// WHAT: Validate outcome link upsert (CO id, PO id, level I/E/D).
// HOW: linkLevelSchema enum + object schema.
// SCREEN: Outcomes linkage grid.
// EDIT: IDs must be non-empty strings matching DB ids.
// KEEP: One level per pair enforced in service, not only Zod.
// RISK: Low.

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
