import "server-only";

/**
 * Subject export CSV/JSON (architecture §10.4) — owner-scoped only.
 */

import { toCsv } from "@/lib/domain/csv";
import { notFound, validationFailed } from "@/lib/http/errors";
import { getSubjectDetailForUser } from "@/lib/queries/subjects";

export type ExportFormat = "csv" | "json";

/** Build export payload for an owned subject. */
export async function exportSubject(
  userId: string,
  subjectId: string,
  format: ExportFormat,
): Promise<{ body: string; contentType: string; filename: string }> {
  const detail = await getSubjectDetailForUser(userId, subjectId);
  if (!detail) throw notFound();

  const code = detail.courseCodeNorm.replace(/\s+/g, "_");
  const filename = `goldensync_${code}.${format}`;

  if (format === "json") {
    return {
      body: JSON.stringify(detail, null, 2),
      contentType: "application/json; charset=utf-8",
      filename,
    };
  }

  if (format !== "csv") {
    throw validationFailed("format must be csv or json.");
  }

  const rows = [
    {
      section: "subject",
      key: detail.courseCode,
      value: detail.title,
      extra: detail.units,
    },
    ...detail.outcomes.map((o) => ({
      section: "outcome",
      key: o.code,
      value: o.description,
      extra: o.kind,
    })),
    ...detail.planWeeks.map((w) => ({
      section: "plan",
      key: `W${w.weekNumber}`,
      value: w.topic ?? "",
      extra: w.notes ?? "",
    })),
    ...detail.assessments.map((a) => ({
      section: "assessment",
      key: a.label,
      value: a.maxScore,
      extra: String(a.position),
    })),
  ];

  return {
    body: toCsv(["section", "key", "value", "extra"], rows),
    contentType: "text/csv; charset=utf-8",
    filename,
  };
}
