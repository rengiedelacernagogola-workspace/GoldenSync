/**
 * Zod schemas — syllabus ingest enqueue.
 */

import { z } from "zod";

export const enqueueIngestSchema = z.object({
  /** Blob path: ingest/{userId}/{uuid}.pdf */
  pathname: z.string().trim().min(1).max(512),
});

export type EnqueueIngestInput = z.infer<typeof enqueueIngestSchema>;
