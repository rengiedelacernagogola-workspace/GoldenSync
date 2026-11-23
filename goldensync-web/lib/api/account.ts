/**
 * Account API client — profile helpers + archived subjects history.
 */

import { apiFetch } from "@/lib/api/client";
import type { SubjectDto } from "@/lib/api/semesters";

export type ArchivedSubjectDto = SubjectDto & {
  semesterLabel: string;
};

/** GET /api/me/archived-subjects */
export function fetchArchivedSubjects() {
  return apiFetch<ArchivedSubjectDto[]>("/api/me/archived-subjects");
}

/** GET /api/me/export — download account JSON. */
export async function downloadAccountExport(): Promise<{
  filename: string;
  blob: Blob;
}> {
  const res = await fetch("/api/me/export", {
    method: "GET",
    credentials: "same-origin",
    headers: { Accept: "application/json" },
  });
  if (!res.ok) {
    let message = res.statusText;
    try {
      const json = (await res.json()) as {
        error?: { message?: string };
      };
      if (json.error?.message) message = json.error.message;
    } catch {
      /* ignore */
    }
    throw new Error(message || "Export failed.");
  }
  const disposition = res.headers.get("Content-Disposition") ?? "";
  const match = /filename="([^"]+)"/.exec(disposition);
  const filename = match?.[1] ?? "goldensync-account-export.json";
  const blob = await res.blob();
  return { filename, blob };
}
