// WHAT: Clerk webhook — syncs login provider events into our database.
// HOW: verifyWebhook checks signature; handles user.deleted cleanup.
// KEEP: Never log webhook secrets. RISK: High — security + user deletion.

/**
 * POST /api/webhooks/clerk — verified Clerk events (architecture Appendix B).
 */

import { verifyWebhook } from "@clerk/nextjs/webhooks";
import { type NextRequest } from "next/server";

import { db } from "@/lib/db";

// WHAT: POST /api/webhooks/clerk — entry; returns 401 on bad signature.
export async function POST(request: NextRequest) {
  if (!process.env.CLERK_WEBHOOK_SECRET) {
    return Response.json(
      {
        error: {
          code: "CONFIG_ERROR",
          message: "CLERK_WEBHOOK_SECRET is not configured.",
        },
      },
      { status: 500 },
    );
  }

  let event: Awaited<ReturnType<typeof verifyWebhook>>;
  try {
    event = await verifyWebhook(request);
  } catch {
    return Response.json(
      {
        error: {
          code: "UNAUTHENTICATED",
          message: "Invalid webhook signature.",
        },
      },
      { status: 401 },
    );
  }

  if (event.type === "user.deleted") {
    const clerkUserId = event.data.id;
    const local = await db.orm.public.User.where({ clerkUserId }).first();
    if (local) {
      await db.orm.public.AuditLog.create({
        userId: local.id,
        action: "clerk.user.deleted",
        entity: "User",
        entityId: local.id,
        metadata: structuredClone({
          clerkUserId: clerkUserId ?? null,
        }) as never,
      });
      await db.orm.public.User.where({ id: local.id }).delete();
    }
  }

  return Response.json({ ok: true });
}
