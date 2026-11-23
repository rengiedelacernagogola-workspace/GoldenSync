import "server-only";

/**
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
