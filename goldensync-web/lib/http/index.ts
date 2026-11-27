/**
 * WHAT: One place to import API helpers (errors, JSON responses, withApi wrapper).
 * HOW: Re-exports from sibling files so routes use `@/lib/http` only.
 * SCREEN: Nothing visible.
 * KEEP: Export names — many API routes depend on them.
 * RISK: High — changing exports can break every API route.
 */

/** HTTP barrel — withApi, errors, responses. */

export { AppError, notFound, unauthenticated, validationFailed } from "./errors";
export type { ErrorCode } from "./errors";
export { errorToResponse, jsonError, jsonOk } from "./response";
export { withApi } from "./with-api";
export type { ApiContext, AuthMode, WithApiOptions } from "./with-api";
