// WHAT: Shared browser `fetch` for GoldenSync APIs — parses `{ data }` / `{ error }` envelopes.
// HOW: apiFetch sends cookies (Clerk session); optional Idempotency-Key on creates.
// SCREEN: Every file under lib/api/* imports this. RISK: Medium — all UI data loads go through here.

/**
 * WHAT: Browser helper to call GoldenSync /api routes and unpack JSON.
 * HOW: fetch → parse `{ data }` or throw ApiClientError from `{ error }`; adds Idempotency-Key on creates.
 * SCREEN: Failures often become toast / inline error messages.
 * KEEP: Envelope shapes must match lib/http/response.ts.
 * RISK: Medium — wrong parsing breaks every live form save.
 *
 * Browser fetch helpers for GoldenSync JSON APIs.
 * Expects `{ data, requestId }` or `{ error, requestId }` envelopes.
 */

export type ApiErrorBody = {
  error: { code: string; message: string; details?: unknown };
  requestId?: string;
};

export class ApiClientError extends Error {
  readonly code: string;
  readonly status: number;
  readonly details?: unknown;
  readonly requestId?: string;

  constructor(
    status: number,
    code: string,
    message: string,
    details?: unknown,
    requestId?: string,
  ) {
    super(message);
    this.name = "ApiClientError";
    this.status = status;
    this.code = code;
    this.details = details;
    this.requestId = requestId;
  }
}

function newIdempotencyKey(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `idemp-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

/** Parse JSON envelope; throw ApiClientError on failure. */
async function parseJson<T>(res: Response): Promise<T> {
  const json = (await res.json()) as
    | { data: T; requestId?: string }
    | ApiErrorBody;
  if (!res.ok || "error" in json) {
    const err = (json as ApiErrorBody).error;
    throw new ApiClientError(
      res.status,
      err?.code ?? "INTERNAL",
      err?.message ?? res.statusText,
      err?.details,
      (json as ApiErrorBody).requestId,
    );
  }
  return (json as { data: T }).data;
}

type RequestOpts = {
  method?: string;
  body?: unknown;
  idempotent?: boolean;
  signal?: AbortSignal;
};

/** Authenticated same-origin API call (Clerk session cookie). */
export async function apiFetch<T>(
  path: string,
  opts: RequestOpts = {},
): Promise<T> {
  const headers: Record<string, string> = {
    Accept: "application/json",
  };
  if (opts.body !== undefined) {
    headers["Content-Type"] = "application/json";
  }
  if (opts.idempotent) {
    headers["Idempotency-Key"] = newIdempotencyKey();
  }

  const res = await fetch(path, {
    method: opts.method ?? (opts.body !== undefined ? "POST" : "GET"),
    headers,
    body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
    credentials: "same-origin",
    signal: opts.signal,
  });

  if (res.status === 204) return undefined as T;
  return parseJson<T>(res);
}
