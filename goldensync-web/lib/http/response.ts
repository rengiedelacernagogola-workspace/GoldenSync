import { NextResponse } from "next/server";

import { AppError, type ErrorCode } from "@/lib/http/errors";

/**
 * WHAT: Builds the standard success/error JSON bodies for API routes.
 * HOW: jsonOk wraps data; jsonError / errorToResponse wrap AppError or unknown failures.
 * SCREEN: Nothing alone — the frontend reads these JSON shapes.
 * KEEP: `{ data, requestId }` and `{ error, requestId }` shapes.
 * RISK: High — changing the shape breaks all clients.
 */

/** Success JSON with request id. */
export function jsonOk<T>(data: T, requestId: string, init?: ResponseInit) {
  return NextResponse.json({ data, requestId }, { status: 200, ...init });
}

/** Error JSON shape from architecture §5.3. */
export function jsonError(
  requestId: string,
  code: ErrorCode,
  message: string,
  status: number,
  details?: unknown,
  headers?: HeadersInit,
) {
  return NextResponse.json(
    {
      error: { code, message, ...(details !== undefined ? { details } : {}) },
      requestId,
    },
    { status, headers },
  );
}

/** Map AppError (or unknown) to the standard problem response. */
export function errorToResponse(requestId: string, err: unknown) {
  if (err instanceof AppError) {
    return jsonError(
      requestId,
      err.code,
      err.message,
      err.status,
      err.details,
      err.code === "RATE_LIMITED"
        ? { "Retry-After": "60" }
        : undefined,
    );
  }
  return jsonError(
    requestId,
    "INTERNAL",
    "Something went wrong.",
    500,
  );
}
