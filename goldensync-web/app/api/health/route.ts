// WHAT: Public health check — uptime JSON; optional ?deep=1 tests database.
// HOW: withApi auth "none" — no login. Deep path queries User row + grade scale flag.
// RISK: High — exposes service/env hints; KEEP rateLimit none only if intentional.

/**
 * GET /api/health — liveness (+ optional DB check via ?deep=1).
 */

import { db } from "@/lib/db";
import { withApi } from "@/lib/http";
import { isGradeScaleConfirmed } from "@/lib/queries/grade-scale";

// WHAT: GET /api/health — returns ok + timestamp; deep mode adds db status.
export const GET = withApi(
  { auth: "none", rateLimit: "none" },
  async (ctx) => {
    const url = new URL(ctx.request.url);
    const deep = url.searchParams.get("deep") === "1";

    const base = {
      ok: true as const,
      service: "goldensync-web",
      time: new Date().toISOString(),
      env: process.env.VERCEL_ENV ?? process.env.NODE_ENV ?? "unknown",
    };

    if (!deep) return base;

    try {
      await db.orm.public.User.where({}).first();
      const gradeScaleConfirmed = await isGradeScaleConfirmed();
      return {
        ...base,
        db: "ok" as const,
        gradeScaleConfirmed,
      };
    } catch (err) {
      ctx.log.error("health_db_failed", {
        message: err instanceof Error ? err.message : String(err),
      });
      return Response.json(
        {
          ok: false,
          service: "goldensync-web",
          time: new Date().toISOString(),
          db: "error",
        },
        { status: 503 },
      );
    }
  },
);
