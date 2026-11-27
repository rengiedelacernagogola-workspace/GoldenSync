import "server-only";

/**
 * WHAT: Server log helper that always includes a requestId.
 * HOW: createLogger returns info/warn/error that print JSON lines to the console.
 * SCREEN: Nothing for users — for developers and hosting logs.
 * EDIT: Swap the console sink later without changing call sites.
 * RISK: Low–Medium — do not log passwords or tokens in fields.
 *
 * Structured logger — requestId-scoped console (Phase 0).
 * Swap sink later without changing call sites.
 */

type LogFields = Record<string, unknown>;

/** Create a child logger bound to one request id. */
export function createLogger(requestId: string) {
  return {
    info(message: string, fields?: LogFields) {
      console.info(JSON.stringify({ level: "info", requestId, message, ...fields }));
    },
    warn(message: string, fields?: LogFields) {
      console.warn(JSON.stringify({ level: "warn", requestId, message, ...fields }));
    },
    error(message: string, fields?: LogFields) {
      console.error(JSON.stringify({ level: "error", requestId, message, ...fields }));
    },
  };
}

export type Logger = ReturnType<typeof createLogger>;

/** New request id for API / server work. */
export function newRequestId(): string {
  return crypto.randomUUID();
}
