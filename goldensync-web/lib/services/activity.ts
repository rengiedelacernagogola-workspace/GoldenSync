import "server-only";

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

/** List recent activities for the signed-in user (newest first). */
export async function listActivities(userId: string): Promise<ActivityDto[]> {
  const rows = await db.orm.public.ActivityEvent.where({ userId }).all();
  return rows
    .map(mapActivity)
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
    .slice(0, MAX_FEED);
}

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

  const all = await db.orm.public.ActivityEvent.where({ userId }).all();
  if (all.length > Math.max(MAX_FEED, limits.MAX_ACTIVITIES)) {
    const sorted = [...all].sort((a, b) => {
      const at = a.createdAt instanceof Date ? a.createdAt.getTime() : 0;
      const bt = b.createdAt instanceof Date ? b.createdAt.getTime() : 0;
      return at - bt;
    });
    const overflow = sorted.slice(0, sorted.length - MAX_FEED);
    for (const row of overflow) {
      await db.orm.public.ActivityEvent.where({ id: row.id }).delete();
    }
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

/**
 * Purge activities older than retentionDays (default 90).
 * Intended for cron / scheduled job — not a user route.
 */
export async function purgeOldActivities(
  retentionDays = 90,
): Promise<number> {
  const cutoff = new Date(Date.now() - retentionDays * 24 * 60 * 60 * 1000);
  const rows = await db.orm.public.ActivityEvent.where({}).all();
  let deleted = 0;
  for (const row of rows) {
    const created =
      row.createdAt instanceof Date
        ? row.createdAt
        : new Date(String(row.createdAt));
    if (created < cutoff) {
      await db.orm.public.ActivityEvent.where({ id: row.id }).delete();
      deleted += 1;
    }
  }
  return deleted;
}
