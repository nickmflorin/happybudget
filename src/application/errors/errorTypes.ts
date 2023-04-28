/**
 * This file contains the error types, {@link ErrorType}, that are defined for the application.  An
 * error type, {@link ErrorType}, is defined as a certain categorization of {@link ErrorCode}(s)
 * that are supported in the application.
 */

import { enumeratedLiterals } from "lib/util/literals";

export type CLIENT_FIELD_VALIDATION = "client-validation";
export type API_FIELD = "field";
export type API_GLOBAL = "global";
export type HTTP_NETWORK = "network";

/**
 * The {@link ErrorType} categorization for errors that are used by the server to communicate an
 * error in the JSON body of the response.
 */
export const ApiErrorTypes = enumeratedLiterals(["field", "global"] as const);
export type ApiErrorType = import("lib/util/literals").EnumeratedLiteralType<typeof ApiErrorTypes>;

/**
 * The {@link ErrorType} categorization for errors that are either embedded in the JSON response
 * body of a failed HTTP request or errors that occur during an HTTP request where either a
 * connection to the server cannot be made or the server does not respond with a response.
 */
export const HttpErrorTypes = enumeratedLiterals([...ApiErrorTypes.__ALL__, "network"] as const);
export type HttpErrorType = import("lib/util/literals").EnumeratedLiteralType<
  typeof HttpErrorTypes
>;

export const CodedErrorTypes = enumeratedLiterals([
  "client-validation",
  ...HttpErrorTypes.__ALL__,
] as const);

export type CodedErrorType = import("lib/util/literals").EnumeratedLiteralType<
  typeof CodedErrorTypes
>;

export const ErrorTypes = enumeratedLiterals([
  ...CodedErrorTypes.__ALL__,
  "malformed-data",
  "file-loading",
  "filename",
] as const);

export type ErrorType = import("lib/util/literals").EnumeratedLiteralType<typeof ErrorTypes>;
