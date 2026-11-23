import "server-only";

/**
 * Semester write use-cases (architecture Phase 1).
 */

import { limits } from "@/lib/config/limits";
import { db } from "@/lib/db";
import { AppError, notFound } from "@/lib/http/errors";
import {
  listSemestersForUser,
  getSemesterForUser,
} from "@/lib/queries/semesters";
import { mapSemester, type SemesterDto } from "@/lib/services/mappers";
import type {
  CreateSemesterInput,
  PatchSemesterInput,
} from "@/lib/validation/semester";

export { listSemestersForUser, getSemesterForUser };

/** Create a semester for the signed-in user (max 30). */
export async function createSemester(
  userId: string,
  input: CreateSemesterInput,
): Promise<SemesterDto> {
  const existing = await db.orm.public.Semester.where({ userId }).all();
  if (existing.length >= limits.MAX_SEMESTERS_PER_USER) {
    throw new AppError(
      "LIMIT_REACHED",
      `You can have at most ${limits.MAX_SEMESTERS_PER_USER} semesters.`,
    );
  }

  const start = new Date(input.startDate);
  const end = new Date(input.endDate);
  if (!(start < end)) {
    throw new AppError(
      "VALIDATION_FAILED",
      "endDate must be after startDate.",
    );
  }

  const row = await db.orm.public.Semester.create({
    userId,
    label: input.label,
    startDate: start,
    endDate: end,
    skippedWeeks: input.skippedWeeks,
  });

  return mapSemester(row);
}

/** Patch owned semester fields. */
export async function updateSemester(
  userId: string,
  semesterId: string,
  input: PatchSemesterInput,
): Promise<SemesterDto> {
  const current = await db.orm.public.Semester.where({
    id: semesterId,
    userId,
  }).first();
  if (!current) throw notFound();

  const start = input.startDate
    ? new Date(input.startDate)
    : new Date(current.startDate as string | Date);
  const end = input.endDate
    ? new Date(input.endDate)
    : new Date(current.endDate as string | Date);
  if (!(start < end)) {
    throw new AppError(
      "VALIDATION_FAILED",
      "endDate must be after startDate.",
    );
  }

  await db.orm.public.Semester.where({ id: semesterId, userId }).update({
    ...(input.label !== undefined ? { label: input.label } : {}),
    ...(input.startDate !== undefined ? { startDate: start } : {}),
    ...(input.endDate !== undefined ? { endDate: end } : {}),
    ...(input.skippedWeeks !== undefined
      ? { skippedWeeks: input.skippedWeeks }
      : {}),
  });

  return getSemesterForUser(userId, semesterId);
}

/** Delete owned semester (cascades subjects). */
export async function deleteSemester(
  userId: string,
  semesterId: string,
): Promise<void> {
  const current = await db.orm.public.Semester.where({
    id: semesterId,
    userId,
  }).first();
  if (!current) throw notFound();
  await db.orm.public.Semester.where({ id: semesterId, userId }).delete();
}
