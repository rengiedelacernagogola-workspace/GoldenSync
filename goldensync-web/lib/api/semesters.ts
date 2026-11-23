/**
 * Semester API client wrappers.
 */

import { apiFetch } from "@/lib/api/client";

export type SemesterDto = {
  id: string;
  label: string;
  startDate: string;
  endDate: string;
  skippedWeeks: number[];
  createdAt: string;
};

export type SubjectDto = {
  id: string;
  semesterId: string;
  courseCode: string;
  courseCodeNorm: string;
  title: string;
  units: string;
  prerequisite: string | null;
  effectivity: string | null;
  grading?: unknown;
  policies?: unknown;
  faculty?: unknown;
  archivedAt: string | null;
  createdAt: string;
};

/** GET /api/semesters */
export function fetchSemesters() {
  return apiFetch<SemesterDto[]>("/api/semesters");
}

/** POST /api/semesters */
export function createSemester(body: {
  label: string;
  startDate: string;
  endDate: string;
  skippedWeeks?: number[];
}) {
  return apiFetch<SemesterDto>("/api/semesters", {
    method: "POST",
    body,
    idempotent: true,
  });
}

/** GET /api/semesters/:id/subjects */
export function fetchSubjects(semesterId: string) {
  return apiFetch<SubjectDto[]>(`/api/semesters/${semesterId}/subjects`);
}

/** POST /api/subjects */
export function createSubject(body: {
  semesterId: string;
  courseCode: string;
  title: string;
  units: number | string;
  prerequisite?: string | null;
  effectivity?: string | null;
  planWeeks?: Array<{ weekNumber: number; topic?: string | null }>;
}) {
  return apiFetch<SubjectDto>("/api/subjects", {
    method: "POST",
    body,
    idempotent: true,
  });
}

/** GET /api/subjects/:id (detail) */
export function fetchSubject(id: string) {
  return apiFetch<SubjectDto & { outcomes: unknown[] }>(`/api/subjects/${id}`);
}

/** GET /api/me */
export function fetchMe() {
  return apiFetch<{
    id: string;
    email: string;
    name: string | null;
  }>("/api/me");
}
