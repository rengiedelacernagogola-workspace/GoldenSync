import "server-only";

// WHAT: CRUD for the in-app activity/notification feed per user.
// HOW: server-only + Prisma; trims feed to limits.MAX_FEED on create.
// SCREEN: Activity bell / feed UI via API routes.
// EDIT: activityKind values must match validation/activity.ts.
// KEEP: purgeOldActivities retention policy (90 days).
// RISK: High — database writes; always scope by userId.

/**
 * Activity feed — server-backed notifications (replaces gs-activity-log).
 * Retention: 90 days (DBDEC-005); purge job stub elsewhere.
 */

import { limits } from "@/lib/config/limits";
import { db } from "@/lib/db";
import type { CreateActivityInput } from "@/lib/validation/activity";

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

const MAX_FEED = 40;

function toIso(value: unknown): string | null {
  if (value == null) return null;
  if (value instanceof Date) return value.toISOString();
  if (typeof value === "string") return value;
  return String(value);
}

function mapActivity(row: {
  id: string;
  kind: string;
  title: string;
  detail: string;
  entity: string | null;
  entityId: string | null;
  readAt: unknown;
  createdAt: unknown;
}): ActivityDto {
  return {
    id: row.id,
    kind: row.kind,
    title: row.title,
    detail: row.detail,
    entity: row.entity,
    entityId: row.entityId,
    readAt: toIso(row.readAt),
    createdAt: toIso(row.createdAt) ?? new Date(0).toISOString(),
  };
}

/**
 * WHAT: Loads the newest notification rows for one signed-in user.
 * HOW: Filter by userId → sort createdAt newest first → take only MAX_FEED (40) in SQL.
 * SCREEN: Bell / activity dropdown list.
 * EDIT: Change MAX_FEED above to show more or fewer rows.
 * RISK: High — always keep the userId filter.
 */
/** List recent activities for the signed-in user (newest first). */
export async function listActivities(userId: string): Promise<ActivityDto[]> {
  const rows = await db.orm.public.ActivityEvent.where({ userId })
    .orderBy((r) => r.createdAt.desc())
    .limit(MAX_FEED)
    .all();
  return rows.map(mapActivity);
}

/**
 * WHAT: Adds one notification, then may delete older extras so the feed stays short.
 * HOW: Insert row → if total past threshold, delete ids older than the newest MAX_FEED in one deleteAll.
 * SCREEN: New row appears at the top of the bell list.
 * EDIT: MAX_FEED and limits.MAX_ACTIVITIES control when trimming starts.
 * RISK: High
 */
/** Create an activity event. Cap feed length by deleting oldest beyond MAX_FEED. */
export async function createActivity(
  userId: string,
  input: CreateActivityInput,
): Promise<ActivityDto> {
  const created = await db.orm.public.ActivityEvent.create({
    userId,
    kind: input.kind,
    title: input.title,
    detail: input.detail,
    entity: input.entity ?? null,
    entityId: input.entityId ?? null,
  });

  // Trim only after crossing the activity cap; keep newest MAX_FEED rows.
  const threshold = Math.max(MAX_FEED, limits.MAX_ACTIVITIES);
  const overflow = await db.orm.public.ActivityEvent.where({ userId })
    .orderBy((r) => r.createdAt.desc())
    .offset(MAX_FEED) // skip the newest MAX_FEED; remainder are candidates to delete
    .all();
  if (overflow.length + MAX_FEED > threshold) {
    const ids = overflow.map((row) => row.id);
    await db.orm.public.ActivityEvent.where((r) => r.id.in(ids)).deleteAll();
  }

  return mapActivity(created);
}

/** Mark all unread activities as read. */
export async function markActivitiesRead(
  userId: string,
): Promise<ActivityDto[]> {
  const rows = await db.orm.public.ActivityEvent.where({ userId }).all();
  const now = new Date();
  for (const row of rows) {
    if (row.readAt == null) {
      await db.orm.public.ActivityEvent.where({ id: row.id }).update({
        readAt: now,
      });
    }
  }
  return listActivities(userId);
}

/** Delete one owned activity; no-op if missing / not owned. Returns updated feed. */
export async function deleteActivity(
  userId: string,
  activityId: string,
): Promise<ActivityDto[]> {
  const row = await db.orm.public.ActivityEvent.where({
    id: activityId,
    userId,
  }).first();
  if (row) {
    await db.orm.public.ActivityEvent.where({ id: row.id }).delete();
  }
  return listActivities(userId);
}

/**
 * WHAT: Wipes this user’s whole activity feed in one database delete.
 * HOW: deleteAll where userId matches → then listActivities (empty).
 * SCREEN: Bell list becomes empty.
 * RISK: High
 */
/** Hard-delete all activities for the signed-in user. Returns empty feed. */
export async function clearActivities(
  userId: string,
): Promise<ActivityDto[]> {
  await db.orm.public.ActivityEvent.where({ userId }).deleteAll();
  return listActivities(userId);
}

/**
 * WHAT: Cron cleanup — removes everyone’s activities older than retentionDays.
 * HOW: One deleteAndCount where createdAt < cutoff (uses ActivityEvent_createdAt_idx).
 * SCREEN: Nothing for users; old rows simply stop existing.
 * EDIT: Default 90 days; change carefully.
 * KEEP: Cron-only — not a user API.
 * RISK: High
 *
 * Purge activities older than retentionDays (default 90).
 * Intended for cron / scheduled job — not a user route.
 */
export async function purgeOldActivities(
  retentionDays = 90,
): Promise<number> {
  const cutoff = new Date(Date.now() - retentionDays * 24 * 60 * 60 * 1000);
  return await db.orm.public.ActivityEvent.where((r) =>
    r.createdAt.lt(cutoff),
  ).deleteAndCount();
}
