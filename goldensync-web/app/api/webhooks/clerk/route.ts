/**
 * POST /api/webhooks/clerk — verified Clerk events (architecture Appendix B).
 */

import { verifyWebhook } from "@clerk/nextjs/webhooks";

import { db } from "@/lib/db";

export async function POST(request: Request) {
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
        metadata: { clerkUserId },
      });
      await db.orm.public.User.where({ id: local.id }).delete();
    }
  }

  return Response.json({ ok: true });
}
