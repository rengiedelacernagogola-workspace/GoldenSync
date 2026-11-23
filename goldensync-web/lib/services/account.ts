import "server-only";

/**
 * Account export + delete (architecture §6.6 / Appendix B).
 */

import { clerkClient } from "@clerk/nextjs/server";

import { db } from "@/lib/db";
import { AppError, notFound, validationFailed } from "@/lib/http/errors";
import { getSubjectDetailForUser } from "@/lib/queries/subjects";
import { mapSemester } from "@/lib/services/mappers";
import type { DeleteAccountInput } from "@/lib/validation/account";

/** Full owned-data export for GET /api/me/export. */
export async function exportAccount(userId: string) {
  const user = await db.orm.public.User.where({ id: userId }).first();
  if (!user) throw notFound();

  const semesters = await db.orm.public.Semester.where({ userId }).all();
  const semesterDtos = [];

  for (const sem of semesters) {
    const subjects = await db.orm.public.Subject.where({
      semesterId: sem.id,
    }).all();
    const subjectDetails = [];
    for (const sub of subjects) {
      subjectDetails.push(await getSubjectDetailForUser(userId, sub.id));
    }
    semesterDtos.push({
      ...mapSemester(sem),
      subjects: subjectDetails,
    });
  }

  const jobs = await db.orm.public.IngestJob.where({ userId }).all();

  return {
    exportedAt: new Date().toISOString(),
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      consentAt: user.consentAt,
      createdAt: user.createdAt,
    },
    semesters: semesterDtos,
    ingestJobs: jobs.map((j) => ({
      id: j.id,
      status: String(j.status),
      errorCode: j.errorCode,
      createdAt: j.createdAt,
    })),
  };
}

/**
 * Delete local data + Clerk user after email confirmation.
 * FLOW: confirm email → audit → delete User (cascade) → Clerk deleteUser.
 */
export async function deleteAccount(
  userId: string,
  clerkUserId: string,
  input: DeleteAccountInput,
): Promise<void> {
  const user = await db.orm.public.User.where({ id: userId }).first();
  if (!user) throw notFound();

  if (input.confirmEmail.toLowerCase() !== user.email.toLowerCase()) {
    throw validationFailed("confirmEmail does not match the account email.");
  }

  await db.orm.public.AuditLog.create({
    userId,
    action: "account.delete",
    entity: "User",
    entityId: userId,
    metadata: { via: "api" },
  });

  await db.orm.public.User.where({ id: userId }).delete();

  try {
    const client = await clerkClient();
    await client.users.deleteUser(clerkUserId);
  } catch (err) {
    throw new AppError(
      "INTERNAL",
      "Local data removed but Clerk user delete failed.",
      { err: err instanceof Error ? err.message : String(err) },
    );
  }
}
