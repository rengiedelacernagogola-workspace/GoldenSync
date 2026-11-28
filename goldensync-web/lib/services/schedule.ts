import "server-only";

/**
 * WHAT: CRUD for My Schedule classes — each row belongs to one signed-in user.
 * HOW: Always filter by userId; overlap check before create/update.
 * SCREEN: /my-schedule list and form Save.
 * EDIT: Overlap message text below. KEEP: Never query by id alone without userId.
 * RISK: High — database + ownership.
 */

import {
  findOverlapConflict,
  type ScheduleModeValue,
} from "@/lib/domain/schedule";
import { db } from "@/lib/db";
import { AppError, notFound } from "@/lib/http/errors";
import type {
  CreateScheduleClassInput,
  UpdateScheduleClassInput,
} from "@/lib/validation/schedule";

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

function toIso(value: unknown): string {
  if (value instanceof Date) return value.toISOString();
  if (typeof value === "string") return value;
  return String(value);
}

function mapRow(row: {
  id: string;
  courseCode: string;
  courseTitle: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  location: string;
  mode: unknown;
  createdAt: unknown;
  updatedAt: unknown;
}): ScheduleClassDto {
  return {
    id: row.id,
    courseCode: row.courseCode,
    courseTitle: row.courseTitle,
    dayOfWeek: row.dayOfWeek,
    startTime: row.startTime,
    endTime: row.endTime,
    location: row.location,
    mode: String(row.mode) as ScheduleModeValue,
    createdAt: toIso(row.createdAt),
    updatedAt: toIso(row.updatedAt),
  };
}

/**
 * WHAT: List all schedule classes for the user (unsorted; UI sorts per day).
 */
export async function listScheduleClasses(
  userId: string,
): Promise<ScheduleClassDto[]> {
  const rows = await db.orm.public.ScheduleClass.where({ userId }).all();
  return rows.map(mapRow);
}

async function assertNoOverlap(
  userId: string,
  input: {
    dayOfWeek: number;
    startTime: string;
    endTime: string;
    excludeId?: string;
  },
) {
  const rows = await db.orm.public.ScheduleClass.where({ userId }).all();
  const conflict = findOverlapConflict(input, rows.map(mapRow));
  if (conflict) {
    throw new AppError(
      "VALIDATION_FAILED",
      `Overlaps with ${conflict.courseCode} — ${conflict.courseTitle} (${conflict.startTime}–${conflict.endTime}).`,
    );
  }
}

/**
 * WHAT: Create one class after overlap check.
 */
export async function createScheduleClass(
  userId: string,
  input: CreateScheduleClassInput,
): Promise<ScheduleClassDto> {
  await assertNoOverlap(userId, input);
  const created = await db.orm.public.ScheduleClass.create({
    userId,
    courseCode: input.courseCode,
    courseTitle: input.courseTitle,
    dayOfWeek: input.dayOfWeek,
    startTime: input.startTime,
    endTime: input.endTime,
    location: input.location,
    mode: input.mode,
  });
  return mapRow(created);
}

/**
 * WHAT: Update owned class; 404 if missing or not owned.
 */
export async function updateScheduleClass(
  userId: string,
  id: string,
  input: UpdateScheduleClassInput,
): Promise<ScheduleClassDto> {
  const existing = await db.orm.public.ScheduleClass.where({
    id,
    userId,
  }).first();
  if (!existing) throw notFound();

  await assertNoOverlap(userId, { ...input, excludeId: id });

  await db.orm.public.ScheduleClass.where({ id, userId }).update({
    courseCode: input.courseCode,
    courseTitle: input.courseTitle,
    dayOfWeek: input.dayOfWeek,
    startTime: input.startTime,
    endTime: input.endTime,
    location: input.location,
    mode: input.mode,
  });

  const updated = await db.orm.public.ScheduleClass.where({
    id,
    userId,
  }).first();
  if (!updated) throw notFound();
  return mapRow(updated);
}

/**
 * WHAT: Delete owned class; no-op 404 if missing.
 */
export async function deleteScheduleClass(
  userId: string,
  id: string,
): Promise<void> {
  const existing = await db.orm.public.ScheduleClass.where({
    id,
    userId,
  }).first();
  if (!existing) throw notFound();
  await db.orm.public.ScheduleClass.where({ id, userId }).delete();
}
