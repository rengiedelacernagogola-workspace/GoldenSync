/**
 * WHAT: Zod schemas for My Schedule create/update API bodies.
 * HOW: Required trimmed strings; day 1–7; HH:mm; end after start; mode enum.
 * SCREEN: Add/Edit Class form — client mirrors these rules.
 * EDIT: Max lengths here when product copy limits change.
 * KEEP: Must stay in sync with lib/domain/schedule.ts time rules.
 * RISK: Medium — weak validation lets bad rows into the DB.
 */

import { z } from "zod";

import { isEndAfterStart } from "@/lib/domain/schedule";

const timeSchema = z
  .string()
  .trim()
  .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Use a valid time (HH:mm).");

export const scheduleModeSchema = z.enum(["FACE_TO_FACE", "ONLINE"]);

export const scheduleDayOfWeekSchema = z.coerce
  .number()
  .int()
  .min(1)
  .max(7);

const scheduleFields = {
  courseCode: z.string().trim().min(1, "Course code is required.").max(40),
  courseTitle: z.string().trim().min(1, "Course title is required.").max(200),
  dayOfWeek: scheduleDayOfWeekSchema,
  startTime: timeSchema,
  endTime: timeSchema,
  location: z.string().trim().min(1, "Room / location is required.").max(120),
  mode: scheduleModeSchema,
};

function refineEndAfterStart<
  T extends { startTime: string; endTime: string },
>(data: T, ctx: z.RefinementCtx) {
  if (!isEndAfterStart(data.startTime, data.endTime)) {
    ctx.addIssue({
      code: "custom",
      path: ["endTime"],
      message: "End time must be later than start time.",
    });
  }
}

export const createScheduleClassSchema = z
  .object(scheduleFields)
  .superRefine(refineEndAfterStart);

export const updateScheduleClassSchema = z
  .object(scheduleFields)
  .superRefine(refineEndAfterStart);

export type CreateScheduleClassInput = z.infer<typeof createScheduleClassSchema>;
export type UpdateScheduleClassInput = z.infer<typeof updateScheduleClassSchema>;
