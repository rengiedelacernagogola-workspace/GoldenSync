// WHAT: Validate enqueue ingest request (blob pathname after client upload).
// HOW: enqueueIngestSchema checks path pattern ingest/{userId}/….
// SCREEN: PDF upload complete → start processing.
// EDIT: Path regex must match domain/ingest-path rules.
// KEEP: userId in path must equal session user.
// RISK: High — auth + path validation prevents cross-user reads.

/**
 * Zod schemas — syllabus ingest enqueue.
 */

import { z } from "zod";

export const enqueueIngestSchema = z.object({
  /** Blob path: ingest/{userId}/{uuid}.pdf */
  pathname: z.string().trim().min(1).max(512),
});

export type EnqueueIngestInput = z.infer<typeof enqueueIngestSchema>;
