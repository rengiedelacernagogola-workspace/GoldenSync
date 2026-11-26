/**
 * Activity / notifications API client.
 */

import { apiFetch } from "@/lib/api/client";

export type ActivityKind =
  | "subject"
  | "notes"
  | "semester"
  | "account"
  | "system";

export type ActivityDto = {
  id: string;
  kind: string;
  title: string;
  detail: string;
  entity: string | null;
  entityId: string | null;
  readAt: string | null;
  createdAt: string;
};

/** GET /api/activity */
export function fetchActivities() {
  return apiFetch<ActivityDto[]>("/api/activity");
}

/** POST /api/activity */
export function postActivity(body: {
  kind: ActivityKind;
  title: string;
  detail: string;
  entity?: string;
  entityId?: string;
}) {
  return apiFetch<ActivityDto>("/api/activity", {
    method: "POST",
    body,
  });
}

/** PATCH /api/activity — mark all read */
export function markActivitiesReadApi() {
  return apiFetch<ActivityDto[]>("/api/activity", { method: "PATCH" });
}

/** DELETE /api/activity?id= — delete one */
export function deleteActivityApi(id: string) {
  const q = new URLSearchParams({ id });
  return apiFetch<ActivityDto[]>(`/api/activity?${q}`, { method: "DELETE" });
}

/** DELETE /api/activity — clear all */
export function clearActivitiesApi() {
  return apiFetch<ActivityDto[]>("/api/activity", { method: "DELETE" });
}
