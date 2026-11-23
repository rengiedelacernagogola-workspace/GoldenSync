import "server-only";

/**
 * Vercel Cron auth — Authorization: Bearer <CRON_SECRET>.
 */

import { AppError } from "@/lib/http/errors";

/** Throw UNAUTHENTICATED unless Bearer matches CRON_SECRET. */
export function assertCronAuthorized(request: Request): void {
  const secret = process.env.CRON_SECRET?.trim();
  if (!secret) {
    throw new AppError(
      "INTERNAL",
      "CRON_SECRET is not configured.",
    );
  }
  const header = request.headers.get("authorization") ?? "";
  const match = /^Bearer\s+(.+)$/i.exec(header);
  const token = match?.[1]?.trim() ?? "";
  if (!token || token !== secret) {
    throw new AppError("UNAUTHENTICATED", "Invalid cron credentials.");
  }
}
