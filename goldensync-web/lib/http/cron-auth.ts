import "server-only";

/**
 * WHAT: Checks that a cron (scheduled job) request has the secret password.
 * HOW: Reads Authorization: Bearer … and compares to CRON_SECRET env var.
 * SCREEN: Nothing — used by server cron routes only.
 * KEEP: Never log or put the secret in comments. Fail closed if unset.
 * RISK: High — weak check lets strangers run purge jobs.
 *
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
