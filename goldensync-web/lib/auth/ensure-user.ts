import "server-only";

/**
 * ensureUser — upsert local User from Clerk (architecture §6.2).
 * FLOW: first authenticated request or webhook delay → find by clerkUserId → create.
 */

import { allowedEmailDomains } from "@/lib/config/env";
import { db } from "@/lib/db";
import { AppError } from "@/lib/http/errors";

export type EnsureUserInput = {
  clerkUserId: string;
  email: string;
  name?: string | null;
};

export type LocalUser = {
  id: string;
  clerkUserId: string;
  email: string;
  name: string | null;
};

/** Reject emails outside ALLOWED_EMAIL_DOMAINS when that list is set (D5). */
function assertAllowedDomain(email: string) {
  const allowed = allowedEmailDomains();
  if (allowed.length === 0) return;
  const domain = email.split("@")[1]?.toLowerCase();
  if (!domain || !allowed.includes(domain)) {
    throw new AppError(
      "FORBIDDEN_DOMAIN",
      "This email domain is not allowed.",
      { domain },
    );
  }
}

/** Idempotent local user for a Clerk identity. */
export async function ensureUser(input: EnsureUserInput): Promise<LocalUser> {
  assertAllowedDomain(input.email);

  const existing = await db.orm.public.User.where({
    clerkUserId: input.clerkUserId,
  }).first();

  if (existing) {
    if (existing.email !== input.email || existing.name !== (input.name ?? null)) {
      await db.orm.public.User.where({ id: existing.id }).update({
        email: input.email,
        name: input.name ?? null,
      });
      return {
        id: existing.id,
        clerkUserId: existing.clerkUserId,
        email: input.email,
        name: input.name ?? null,
      };
    }
    return {
      id: existing.id,
      clerkUserId: existing.clerkUserId,
      email: existing.email,
      name: existing.name,
    };
  }

  const created = await db.orm.public.User.create({
    clerkUserId: input.clerkUserId,
    email: input.email,
    name: input.name ?? null,
  });

  return {
    id: created.id,
    clerkUserId: created.clerkUserId,
    email: created.email,
    name: created.name,
  };
}
