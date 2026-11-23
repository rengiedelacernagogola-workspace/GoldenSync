/** HTTP barrel — withApi, errors, responses. */

export { AppError, notFound, unauthenticated, validationFailed } from "./errors";
export type { ErrorCode } from "./errors";
export { errorToResponse, jsonError, jsonOk } from "./response";
export { withApi } from "./with-api";
export type { ApiContext, AuthMode, WithApiOptions } from "./with-api";
