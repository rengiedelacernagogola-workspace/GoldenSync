// WHAT: HTTP client for course-outcome → program-outcome links (I/E/D levels).
// HOW: GET list and PUT full replace via apiFetch on /api/subjects/:id/outcome-links.
// SCREEN: Outcomes / syllabus mapping UI. RISK: Medium — changes accreditation mapping.

/**
 * OutcomeLink API client — CO→PO I/E/D map.
 */

import { apiFetch } from "@/lib/api/client";

export type OutcomeLinkDto = {
  id: string;
  coId: string;
  poId: string;
  level: "I" | "E" | "D";
};

/** GET /api/subjects/:id/outcome-links */
export function fetchOutcomeLinks(subjectId: string) {
  return apiFetch<OutcomeLinkDto[]>(
    `/api/subjects/${subjectId}/outcome-links`,
  );
}

/** PUT /api/subjects/:id/outcome-links */
export function replaceOutcomeLinks(
  subjectId: string,
  links: Array<{ coId: string; poId: string; level: "I" | "E" | "D" }>,
) {
  return apiFetch<OutcomeLinkDto[]>(
    `/api/subjects/${subjectId}/outcome-links`,
    { method: "PUT", body: { links } },
  );
}
