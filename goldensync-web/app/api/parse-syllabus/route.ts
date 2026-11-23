/**
 * POST /api/parse-syllabus — server PDF parse (Q-002).
 * Body: multipart form field `file` (application/pdf).
 * RULE: pdf-parse only here / lib/pdf — never in client components.
 */

import { NextResponse } from "next/server";

import { parseSyllabusPdf } from "@/lib/pdf/syllabus-parser";

export async function POST(request: Request) {
  try {
    const form = await request.formData();
    const file = form.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json(
        { ok: false, code: "invalid", message: "Missing file field." },
        { status: 400 },
      );
    }

    if (file.type && file.type !== "application/pdf") {
      return NextResponse.json(
        { ok: false, code: "invalid", message: "PDF only." },
        { status: 400 },
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const result = await parseSyllabusPdf(buffer);

    if (!result.ok) {
      const status =
        result.code === "toolarge"
          ? 413
          : result.code === "encrypted"
            ? 422
            : 400;
      return NextResponse.json(result, { status });
    }

    return NextResponse.json({
      ok: true,
      pages: result.pages,
      previewLines: result.previewLines,
      /* Truncate full text for response size; proto form uses preview */
      textPreview: result.text.slice(0, 4000),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Parse failed.";
    return NextResponse.json(
      { ok: false, code: "error", message },
      { status: 500 },
    );
  }
}
