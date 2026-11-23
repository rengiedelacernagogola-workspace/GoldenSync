import "server-only";

/**
 * meService — current local user profile for GET /api/me.
 */

import { db } from "@/lib/db";
import { notFound } from "@/lib/http/errors";

/** Load the signed-in user's local row (must already be ensured). */
export async function getMe(userId: string) {
  const user = await db.orm.public.User.where({ id: userId })
    .select("id", "clerkUserId", "email", "name", "consentAt", "createdAt")
    .first();

  if (!user) throw notFound();

  return {
    id: user.id,
    clerkUserId: user.clerkUserId,
    email: user.email,
    name: user.name,
    consentAt: user.consentAt,
    createdAt: user.createdAt,
  };
}
