/**
 * WHAT: Browser client for My Schedule APIs.
 * HOW: apiFetch wrappers for list / create / update / delete.
 * SCREEN: /my-schedule page. RISK: Medium — writes user timetable.
 */

import { apiFetch } from "@/lib/api/client";
import type { ScheduleModeValue } from "@/lib/domain/schedule";

export type ScheduleClassDto = {
  id: string;
  courseCode: string;
  courseTitle: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  location: string;
  mode: ScheduleModeValue;
  createdAt: string;
  updatedAt: string;
};

export type ScheduleClassInput = {
  courseCode: string;
  courseTitle: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  location: string;
  mode: ScheduleModeValue;
};

/** GET /api/schedule */
export function fetchScheduleClasses() {
  return apiFetch<ScheduleClassDto[]>("/api/schedule");
}

/** POST /api/schedule */
export function createScheduleClass(body: ScheduleClassInput) {
  return apiFetch<ScheduleClassDto>("/api/schedule", {
    method: "POST",
    body,
  });
}

/** PATCH /api/schedule/:id */
export function updateScheduleClass(id: string, body: ScheduleClassInput) {
  return apiFetch<ScheduleClassDto>(`/api/schedule/${id}`, {
    method: "PATCH",
    body,
  });
}

/** DELETE /api/schedule/:id */
export function deleteScheduleClass(id: string) {
  return apiFetch<{ ok: boolean }>(`/api/schedule/${id}`, {
    method: "DELETE",
  });
}
