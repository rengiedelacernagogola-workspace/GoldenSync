import "server-only";

// WHAT: Download uploaded PDF from Blob, extract syllabus fields, store on IngestJob.
// HOW: Vercel get + pdf parser + domain extractors; updates job row.
// SCREEN: Ingest progress / confirm extracted syllabus.
// EDIT: Extraction pipeline wiring here, not in domain regex files alone.
// KEEP: Runs in Next.js — avoid depending on broken worker bundling.
// RISK: High — Blob access + DB; validate pathname before download.

/**
 * Download Blob + parse syllabus PDF + update IngestJob.
 * Runs in the Next.js server (reliable). Trigger worker cannot bundle pdf.worker.mjs.
 */

import { get } from "@vercel/blob";

import { limits } from "@/lib/config/limits";
import { db } from "@/lib/db";
import { isPdfMagic } from "@/lib/domain/pdf-magic";
import { extractGradingTemplateFromText } from "@/lib/domain/grading-template";
import { extractSyllabusFields } from "@/lib/domain/syllabus-extract";
import { extractPlanWeeksFromText } from "@/lib/domain/syllabus-plan";
import { parseSyllabusPdf } from "@/lib/pdf/syllabus-parser";

export type ProcessIngestResult = {
  status: "NEEDS_REVIEW" | "FAILED";
  errorCode: string | null;
};

/** Download private blob bytes by pathname. */
async function downloadBlobBytes(
  pathname: string,
): Promise<{ bytes: Uint8Array | null; detail: string | null }> {
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) {
    return { bytes: null, detail: "BLOB_READ_WRITE_TOKEN missing" };
  }

  try {
    const result = await get(pathname, {
      access: "private",
      token,
      useCache: false,
    });
    if (!result || result.statusCode !== 200 || !result.stream) {
      return { bytes: null, detail: "Blob not found or empty stream" };
    }
    const buf = await new Response(result.stream).arrayBuffer();
    return { bytes: new Uint8Array(buf), detail: null };
  } catch (err) {
    return {
      bytes: null,
      detail: err instanceof Error ? err.message : String(err),
    };
  }
}

/**
 * Process a QUEUED job in-process. Idempotent if status is no longer QUEUED.
 */
export async function processIngestJob(
  jobId: string,
  userId: string,
): Promise<ProcessIngestResult> {
  const job = await db.orm.public.IngestJob.where({
    id: jobId,
    userId,
  }).first();

  if (!job) {
    return { status: "FAILED", errorCode: "NOT_FOUND" };
  }
  if (String(job.status) !== "QUEUED") {
    const st = String(job.status);
    if (st === "NEEDS_REVIEW" || st === "FAILED") {
      return { status: st, errorCode: job.errorCode };
    }
    return { status: "FAILED", errorCode: job.errorCode ?? "INTERNAL" };
  }

  const pathname = job.blobPathname;
  if (!pathname) {
    await db.orm.public.IngestJob.where({ id: job.id }).update({
      status: "FAILED",
      errorCode: "PDF_INVALID",
      result: { message: "Missing blob pathname on job" },
    });
    return { status: "FAILED", errorCode: "PDF_INVALID" };
  }

  await db.orm.public.IngestJob.where({ id: job.id }).update({
    status: "RUNNING",
  });

  try {
    const { bytes, detail } = await downloadBlobBytes(pathname);
    if (!bytes || bytes.byteLength === 0) {
      await db.orm.public.IngestJob.where({ id: job.id }).update({
        status: "FAILED",
        errorCode: "PDF_INVALID",
        result: { message: detail ?? "Could not download PDF from Blob" },
      });
      return { status: "FAILED", errorCode: "PDF_INVALID" };
    }

    if (bytes.byteLength > limits.MAX_PDF_BYTES) {
      await db.orm.public.IngestJob.where({ id: job.id }).update({
        status: "FAILED",
        errorCode: "PDF_TOO_LARGE",
        result: { message: `PDF exceeds ${limits.MAX_PDF_BYTES} bytes` },
      });
      return { status: "FAILED", errorCode: "PDF_TOO_LARGE" };
    }

    if (!isPdfMagic(bytes)) {
      await db.orm.public.IngestJob.where({ id: job.id }).update({
        status: "FAILED",
        errorCode: "PDF_INVALID",
        result: { message: "File is not a valid PDF (%PDF- magic missing)" },
      });
      return { status: "FAILED", errorCode: "PDF_INVALID" };
    }

    const parsed = await parseSyllabusPdf(Buffer.from(bytes));
    if (!parsed.ok) {
      const codeMap: Record<string, string> = {
        invalid: "PDF_INVALID",
        toolarge: "PDF_TOO_LARGE",
        encrypted: "PDF_ENCRYPTED",
        scanned: "PDF_SCANNED",
        timeout: "PARSE_TIMEOUT",
        error: "INTERNAL",
      };
      const errorCode = codeMap[parsed.code] ?? "INTERNAL";
      await db.orm.public.IngestJob.where({ id: job.id }).update({
        status: "FAILED",
        errorCode,
        result: { message: parsed.message, code: parsed.code },
      });
      return { status: "FAILED", errorCode };
    }

    const planWeeks = extractPlanWeeksFromText(parsed.text);
    const fields = extractSyllabusFields(parsed.text, parsed.previewLines);
    const gradingTemplate = extractGradingTemplateFromText(parsed.text);
    await db.orm.public.IngestJob.where({ id: job.id }).update({
      status: "NEEDS_REVIEW",
      errorCode: null,
      result: {
        flags: [
          {
            path: "parser",
            reason: "Confirm extracted fields in the review form",
          },
        ],
        meta: {
          bytes: bytes.byteLength,
          pathname,
          pages: parsed.pages,
          processedBy: "next-api",
          planWeekCount: planWeeks.length,
          outcomeCount: fields.outcomes.length,
          assessmentCount: fields.assessments.length,
          gradingCoGroupCount: gradingTemplate?.coGroups.length ?? 0,
        },
        draft: {
          courseCode: fields.courseCode,
          title: fields.title,
          units: fields.units,
          prerequisite: fields.prerequisite,
          effectivity: fields.effectivity,
          outcomes: fields.outcomes,
          planWeeks,
          assessments: fields.assessments,
          classPolicies: fields.classPolicies,
          facultyName: fields.facultyName,
          gradingBlurb: fields.gradingBlurb,
          gradingTemplate,
          previewLines: parsed.previewLines,
        },
      },
    });

    return { status: "NEEDS_REVIEW", errorCode: null };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    await db.orm.public.IngestJob.where({ id: job.id }).update({
      status: "FAILED",
      errorCode: "INTERNAL",
      result: { message, code: "process_exception" },
    });
    return { status: "FAILED", errorCode: "INTERNAL" };
  }
}
