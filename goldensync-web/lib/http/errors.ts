/**
 * AppError model (architecture §5.3) — stable codes, safe messages.
 */

export type ErrorCode =
  | "UNAUTHENTICATED"
  | "SESSION_EXPIRED"
  | "NOT_FOUND"
  | "VALIDATION_FAILED"
  | "RATE_LIMITED"
  | "LIMIT_REACHED"
  | "DUPLICATE_COURSE_CODE"
  | "CONFLICT_VERSION"
  | "IDEMPOTENCY_KEY_REUSED"
  | "PDF_INVALID"
  | "PDF_TOO_LARGE"
  | "PDF_ENCRYPTED"
  | "FORBIDDEN_DOMAIN"
  | "INTERNAL"
  | "CONFIG_ERROR";

const HTTP_BY_CODE: Record<ErrorCode, number> = {
  UNAUTHENTICATED: 401,
  SESSION_EXPIRED: 401,
  NOT_FOUND: 404,
  VALIDATION_FAILED: 422,
  RATE_LIMITED: 429,
  LIMIT_REACHED: 409,
  DUPLICATE_COURSE_CODE: 409,
  CONFLICT_VERSION: 409,
  IDEMPOTENCY_KEY_REUSED: 422,
  PDF_INVALID: 422,
  PDF_TOO_LARGE: 422,
  PDF_ENCRYPTED: 422,
  FORBIDDEN_DOMAIN: 403,
  INTERNAL: 500,
  CONFIG_ERROR: 500,
};

/** Typed application error thrown from services / withApi. */
export class AppError extends Error {
  readonly code: ErrorCode;
  readonly status: number;
  readonly details?: unknown;

  constructor(code: ErrorCode, message: string, details?: unknown) {
    super(message);
    this.name = "AppError";
    this.code = code;
    this.status = HTTP_BY_CODE[code];
    this.details = details;
  }
}

/** 401 — no Clerk session. */
export function unauthenticated(
  message = "Sign in to continue.",
): AppError {
  return new AppError("UNAUTHENTICATED", message);
}

/** 404 — missing or not owned (no existence leak). */
export function notFound(message = "Not found."): AppError {
  return new AppError("NOT_FOUND", message);
}

/** 422 — Zod / input failure. */
export function validationFailed(
  message = "Check the highlighted fields.",
  details?: unknown,
): AppError {
  return new AppError("VALIDATION_FAILED", message, details);
}
