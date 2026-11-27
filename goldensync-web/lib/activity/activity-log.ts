// WHAT: UI-facing activity feed — maps API DTOs to ActivityItem, sorts newest first.
// HOW: load/push/mark/delete/clear call lib/api/activity; failures often return [] not throw.
// SCREEN: Notification bell list and unread badge. RISK: Medium.

/**
 * Activity log — API-backed notifications (replaces localStorage gs-activity-log).
 * Theme remains client-only (DBDEC-004).
 */

import {
  clearActivitiesApi,
  deleteActivityApi,
  fetchActivities,
  markActivitiesReadApi,
  postActivity,
  type ActivityDto,
  type ActivityKind,
} from "@/lib/api/activity";

export type { ActivityKind };

export interface ActivityItem {
  id: string;
  kind: ActivityKind;
  title: string;
  detail: string;
  createdAt: number;
  read?: boolean;
}

function fromDto(row: ActivityDto): ActivityItem {
  const kind = (
    ["subject", "notes", "semester", "account", "system"].includes(row.kind)
      ? row.kind
      : "system"
  ) as ActivityKind;
  return {
    id: row.id,
    kind,
    title: row.title,
    detail: row.detail,
    createdAt: Date.parse(row.createdAt) || Date.now(),
    read: row.readAt != null,
  };
}

/** Load activity items (newest first). */
// WHAT: Initial fetch for bell panel — swallows errors to empty list.
export async function loadActivities(): Promise<ActivityItem[]> {
  try {
    const rows = await fetchActivities();
    return rows.map(fromDto).sort((a, b) => b.createdAt - a.createdAt);
  } catch {
    return [];
  }
}

/** Prepend one activity; returns the new list. */
export async function pushActivity(
  entry: Omit<ActivityItem, "id" | "createdAt" | "read">,
): Promise<ActivityItem[]> {
  try {
    await postActivity({
      kind: entry.kind,
      title: entry.title,
      detail: entry.detail,
    });
  } catch {
    /* non-blocking for UI actions */
  }
  return loadActivities();
}

/** Mark all as read. */
export async function markActivitiesRead(): Promise<ActivityItem[]> {
  try {
    const rows = await markActivitiesReadApi();
    return rows.map(fromDto);
  } catch {
    return loadActivities();
  }
}

/** Delete one activity; returns the updated list. */
export async function deleteActivity(id: string): Promise<ActivityItem[]> {
  try {
    const rows = await deleteActivityApi(id);
    return rows
      .map(fromDto)
      .sort((a, b) => b.createdAt - a.createdAt);
  } catch {
    return loadActivities();
  }
}

/** Clear all activities; returns the updated list. */
export async function clearActivities(): Promise<ActivityItem[]> {
  try {
    const rows = await clearActivitiesApi();
    return rows
      .map(fromDto)
      .sort((a, b) => b.createdAt - a.createdAt);
  } catch {
    return loadActivities();
  }
}

/** Unread count. */
export function unreadActivityCount(items?: ActivityItem[]): number {
  const list = items ?? [];
  return list.filter((a) => !a.read).length;
}

/** Relative time label. */
// WHAT: "Just now" / "5m ago" style strings for each row. EDIT: Thresholds here. RISK: Low.
export function formatActivityTime(createdAt: number): string {
  const diff = Math.max(0, Date.now() - createdAt);
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(createdAt).toLocaleDateString();
}
