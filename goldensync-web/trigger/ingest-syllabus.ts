/**
 * Trigger.dev task — syllabus ingest (architecture §9).
 *
 * NOTE: PDF text extraction must NOT run here. Trigger's build drops
 * pdf-parse's pdf.worker.mjs ("Setting up fake worker failed").
 * Parsing runs in Next.js via `processIngestJob` (lib/services/ingest-process.ts).
 *
 * This task is a no-op claim helper: if a job is still QUEUED (legacy /
 * crashed API), it marks FAILED with a clear code so the UI does not hang.
 */

import { task } from "@trigger.dev/sdk/v3";
import postgres from "@prisma/orm-postgres/runtime";
import { contractFromJson } from "@prisma/orm-postgres/static";

import type { Contract } from "../lib/db/contract";
import contractJson from "../lib/db/contract.json" with { type: "json" };
import { databaseUrlForWorker } from "./load-env";

type Payload = {
  jobId: string;
  userId: string;
  pathname: string;
};

const contract = contractFromJson<Contract>(contractJson);

function dbClient() {
  return postgres({
    contract,
    url: databaseUrlForWorker(),
  });
}

export const ingestSyllabus = task({
  id: "ingest-syllabus",
  retry: { maxAttempts: 1 },
  run: async (payload: Payload) => {
    const db = dbClient();
    try {
      const job = await db.orm.public.IngestJob.where({
        id: payload.jobId,
        userId: payload.userId,
      }).first();

      if (!job) {
        return { skipped: true, reason: "missing" };
      }

      const status = String(job.status);
      if (status !== "QUEUED" && status !== "RUNNING") {
        return { skipped: true, reason: "already_terminal", status };
      }

      await db.orm.public.IngestJob.where({ id: job.id }).update({
        status: "FAILED",
        errorCode: "INTERNAL",
        result: {
          message:
            "PDF parse runs on the Next.js server, not Trigger. Re-upload; if this persists, check /api/subjects/ingest.",
          code: "worker_deprecated_for_parse",
        },
      });

      return { failed: true, errorCode: "INTERNAL" };
    } finally {
      await db.close();
    }
  },
});
