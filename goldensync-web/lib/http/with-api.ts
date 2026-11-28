import "server-only";

/**
 * WHAT: Wrapper around every API route — login check, body check, rate limit, errors.
 * HOW: requestId → same-origin for writes → Clerk auth → ensureUser → Zod body → handler → JSON.
 * SCREEN: Nothing alone — powers all /api responses the UI calls.
 * KEEP: Auth modes and error mapping; do not bypass for "convenience".
 * RISK: High — this is the security front door for the API.
 *
 * withApi — request pipeline (architecture §5.1).
 * FLOW: requestId → origin (mutations) → Clerk auth → validate → handler → map errors.
 */

import { auth, currentUser } from "@clerk/nextjs/server";
import type { ZodType } from "zod";

import { ensureUser } from "@/lib/auth/ensure-user";
import { parseSoftLockAtFromHeader } from "@/lib/auth/soft-lock";
import { limits } from "@/lib/config/limits";
import { AppError, unauthenticated, validationFailed } from "@/lib/http/errors";
import { checkRateLimit } from "@/lib/http/rate-limit";
import { errorToResponse, jsonOk } from "@/lib/http/response";
import { createLogger, newRequestId } from "@/lib/observability/logger";

export type AuthMode = "required" | "optional" | "none";

export type WithApiOptions<TBody> = {
  auth?: AuthMode;
  body?: ZodType<TBody>;
  /** read/write use per-user in-memory windows; none skips. */
  rateLimit?: "read" | "write" | "none";
};

export type ApiContext<TBody, TParams extends Record<string, string>> = {
  request: Request;
  requestId: string;
  /** Local User.id after ensureUser (null when auth is none/optional unsigned). */
  userId: string | null;
  clerkUserId: string | null;
  body: TBody;
  params: TParams;
  log: ReturnType<typeof createLogger>;
};

type RouteContext = { params: Promise<Record<string, string>> };

/** Reject cross-origin mutations (architecture §6.7). */
function assertSameOrigin(request: Request) {
  const method = request.method.toUpperCase();
  if (method === "GET" || method === "HEAD" || method === "OPTIONS") return;

  const site = request.headers.get("sec-fetch-site");
  if (site === "same-origin" || site === "none" || site === null) {
    /* same-origin or non-browser / same-site missing — check Origin when present */
  } else if (site === "cross-site") {
    throw new AppError("UNAUTHENTICATED", "Cross-origin request blocked.");
  }

  const origin = request.headers.get("origin");
  if (!origin) return;
  const expected = new URL(request.url).origin;
  if (origin !== expected) {
    throw new AppError("UNAUTHENTICATED", "Cross-origin request blocked.");
  }
}

/**
 * Wrap a Route Handler with auth, validation, and error mapping.
 * Handler may return a Response or a plain value (wrapped as { data, requestId }).
 */
export function withApi<
  TBody = undefined,
  TParams extends Record<string, string> = Record<string, string>,
>(
  options: WithApiOptions<TBody>,
  handler: (ctx: ApiContext<TBody, TParams>) => Promise<Response | unknown>,
) {
  const authMode: AuthMode = options.auth ?? "required";

  return async (request: Request, routeCtx?: RouteContext) => {
    const requestId = newRequestId();
    const log = createLogger(requestId);

    try {
      assertSameOrigin(request);

      let clerkUserId: string | null = null;
      let userId: string | null = null;

      if (authMode !== "none") {
        const session = await auth();
        clerkUserId = session.userId;
        if (authMode === "required" && !clerkUserId) {
          throw unauthenticated();
        }
        // WHAT: Soft-lock cookie present → treat as logged out for APIs until Continue or hard logout.
        // KEEP: Blocks data access while the UI looks signed out but Clerk session is still warm.
        if (
          clerkUserId &&
          parseSoftLockAtFromHeader(request.headers.get("cookie")) != null
        ) {
          throw unauthenticated(
            "Session is locked. Sign in again to continue.",
          );
        }
        if (clerkUserId) {
          const clerk = await currentUser();
          const email =
            clerk?.primaryEmailAddress?.emailAddress ??
            clerk?.emailAddresses[0]?.emailAddress;
          if (!email) {
            throw unauthenticated("Email required on the Clerk account.");
          }
          const local = await ensureUser({
            clerkUserId,
            email,
            name: clerk?.fullName ?? clerk?.firstName ?? null,
          });
          userId = local.id;
        }
      }

      const rateMode = options.rateLimit ?? "none";
      if (rateMode !== "none") {
        const identity = userId ?? clerkUserId ?? "anon";
        const perMin =
          rateMode === "write"
            ? limits.WRITE_RATE_PER_MINUTE
            : limits.READ_RATE_PER_MINUTE;
        const rl = checkRateLimit(
          `${rateMode}:${identity}`,
          perMin,
          60_000,
        );
        if (!rl.allowed) {
          throw new AppError("RATE_LIMITED", "Too many requests. Try again shortly.");
        }
      }

      let body = undefined as TBody;
      if (options.body) {
        const contentType = request.headers.get("content-type") ?? "";
        if (!contentType.includes("application/json")) {
          throw validationFailed("Content-Type must be application/json.");
        }
        const raw: unknown = await request.json();
        const parsed = options.body.safeParse(raw);
        if (!parsed.success) {
          throw validationFailed("Check the highlighted fields.", parsed.error.flatten());
        }
        body = parsed.data;
      }

      const params = (routeCtx
        ? await routeCtx.params
        : {}) as TParams;

      const result = await handler({
        request,
        requestId,
        userId,
        clerkUserId,
        body,
        params,
        log,
      });

      if (result instanceof Response) return result;
      return jsonOk(result, requestId);
    } catch (err) {
      if (!(err instanceof AppError) || err.code === "INTERNAL") {
        log.error("api_unhandled", {
          err: err instanceof Error ? err.message : String(err),
        });
      } else {
        log.warn("api_error", { code: err.code });
      }
      return errorToResponse(requestId, err);
    }
  };
}
