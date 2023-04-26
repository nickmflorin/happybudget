import { type FieldError as RootFieldError } from "react-hook-form";

import { enumeratedLiterals } from "lib/util/literals";

import { STATUS_CODES, StatusCode } from "../api/types";

import { CodedErrorType, CodedErrorTypes } from "./errorTypes";

/**
 * Error codes that are used by the "react-hook-form" package to communicate client side validation
 * errors.
 *
 * There will be cases where the same type of validation is performed both server side and client
 * side (i.e. validating that a required field is present), in which case the codes that communicate
 * this error on the server (i.e. {@link ApiFieldErrorCode}) should be the same as the codes that
 * communicate this error on the client (i.e. {@link ClientValidationErrorCode}).  This guarantees
 * they have the same end result.  Since we cannot change the error codes used by "react-hook-form",
 * the {@link ApiFieldErrorCode} must use their version.
 *
 * Note:
 * ----
 * This constant does not include *all* of the codes that are offered by "react-hook-form" - just
 * the ones that are likely to be used in the application.  This simplifies the related type
 * bindings by not including extraneous codes. A complete list of codes that are used by the
 * "react-hook-form" package can be inspected from the {@link RegisterOptions} type they export,
 * which you can refer to here:
 *
 * https://github.com/react-hook-form/react-hook-form/blob/master/src/types/validator.ts#L25
 */
export const ClientValidationErrorCodes = enumeratedLiterals([
  "min",
  "max",
  "maxLength",
  "minLength",
  "pattern",
  "required",
  "value",
  "valueAsDate",
  "valueAsNumber",
] as const);

export type ClientValidationErrorCode = import("lib/util/types").EnumeratedLiteralType<
  typeof ClientValidationErrorCodes
>;

export type ClientValidationError<T extends ClientValidationErrorCode = ClientValidationErrorCode> =
  // We don't need to worry about multiple types now, and probably ever.
  Omit<RootFieldError, "type" | "types"> & { type: T };

export const UNKNOWN = "unknown" as const;
export type UNKNOWN = typeof UNKNOWN;

export const AuthErrorCodes = enumeratedLiterals([
  "token_expired",
  "token_not_valid",
  "invalid_social_token",
  "invalid_social_provider",
  "account_not_verified",
  "account_disabled",
  "account_not_on_waitlist",
  "account_not_authenticated",
] as const);
export type AuthErrorCode = import("lib/util/types").EnumeratedLiteralType<typeof AuthErrorCodes>;

export const PermissionErrorCodes = enumeratedLiterals([
  "permission_error",
  "product_permission_error",
] as const);
export type PermissionErrorCode = import("lib/util/types").EnumeratedLiteralType<
  typeof PermissionErrorCodes
>;

export const BillingErrorCodes = enumeratedLiterals([
  "stripe_request_error",
  "checkout_error",
  "checkout_session_inactive",
] as const);
export type BillingErrorCode = import("lib/util/types").EnumeratedLiteralType<
  typeof BillingErrorCodes
>;

export const ApiFieldErrorCodes = enumeratedLiterals([
  "required",
  "invalid",
  "unique",
  "email_does_not_exist",
  "invalid_credentials",
  "invalid_file_name",
  "invalid_file_extension",
  UNKNOWN,
] as const);

export type ApiFieldErrorCode = import("lib/util/types").EnumeratedLiteralType<
  typeof ApiFieldErrorCodes
>;

export const ApiGlobalErrorCodes = enumeratedLiterals([
  ...PermissionErrorCodes.__ALL__,
  ...BillingErrorCodes.__ALL__,
  ...AuthErrorCodes.__ALL__,
  UNKNOWN,
  "not_found",
  "method_not_allowed",
  "internal_server_error",
  "bad_request",
  "unauthorized",
  "forbidden",
  "service_unavailable",
  "body_not_serializable",
  "body_not_present",
] as const);

export type ApiGlobalErrorCode = import("lib/util/types").EnumeratedLiteralType<
  typeof ApiGlobalErrorCodes
>;

export const ApiErrorCodes = enumeratedLiterals([
  ...ApiGlobalErrorCodes.__ALL__,
  ...ApiFieldErrorCodes.__ALL__,
] as const);
export type ApiErrorCode = import("lib/util/types").EnumeratedLiteralType<typeof ApiErrorCodes>;

export const NetworkErrorCodes = enumeratedLiterals(["network"] as const);
export type NetworkErrorCode = import("lib/util/types").EnumeratedLiteralType<
  typeof NetworkErrorCodes
>;

export const DEFAULT_STATUS_CODES: Partial<{ [key in ApiGlobalErrorCode]: StatusCode }> = {
  [ApiErrorCodes.BAD_REQUEST]: STATUS_CODES.HTTP_400_BAD_REQUEST,
  [ApiErrorCodes.UNAUTHORIZED]: STATUS_CODES.HTTP_401_UNAUTHORIZED,
  [ApiErrorCodes.FORBIDDEN]: STATUS_CODES.HTTP_403_FORBIDDEN,
  [ApiErrorCodes.NOT_FOUND]: STATUS_CODES.HTTP_404_NOT_FOUND,
  [ApiErrorCodes.METHOD_NOT_ALLOWED]: STATUS_CODES.HTTP_405_METHOD_NOT_ALLOWED,
  [ApiErrorCodes.INTERNAL_SERVER_ERROR]: STATUS_CODES.HTTP_500_INTERNAL_SERVER_ERROR,
  [ApiErrorCodes.SERVICE_UNAVAILABLE]: STATUS_CODES.HTTP_503_SERVICE_UNAVAILABLE,
};

export const getDefaultGlobalStatusCode = (errorCode: ApiGlobalErrorCode): StatusCode | null =>
  DEFAULT_STATUS_CODES[errorCode] || null;

export const getDefaultGlobalErrorCode = (statusCode: StatusCode): ApiGlobalErrorCode | null => {
  let errorCode: ApiGlobalErrorCode;
  for (errorCode in DEFAULT_STATUS_CODES) {
    if (DEFAULT_STATUS_CODES[errorCode] === statusCode) {
      return errorCode;
    }
  }
  return null;
};

export const ErrorCodes = enumeratedLiterals([
  ...ClientValidationErrorCodes.__ALL__,
  ...ApiFieldErrorCodes.__ALL__,
  ...ApiGlobalErrorCodes.__ALL__,
  ...NetworkErrorCodes.__ALL__,
] as const);

export type ErrorTypeCodes = {
  "client-validation": typeof ClientValidationErrorCodes;
  field: typeof ApiFieldErrorCodes;
  global: typeof ApiGlobalErrorCodes;
  network: typeof NetworkErrorCodes;
};

export const ErrorTypeCodes: ErrorTypeCodes = {
  [CodedErrorTypes.FIELD]: ApiFieldErrorCodes,
  [CodedErrorTypes.GLOBAL]: ApiGlobalErrorCodes,
  [CodedErrorTypes.CLIENT_VALIDATION]: ClientValidationErrorCodes,
  [CodedErrorTypes.NETWORK]: NetworkErrorCodes,
};

export type ErrorCode<T extends CodedErrorType | undefined = undefined> = T extends undefined
  ? import("lib/util/types").EnumeratedLiteralType<typeof ErrorCodes>
  : import("lib/util/types").EnumeratedLiteralType<ErrorTypeCodes[T & keyof ErrorTypeCodes]>;

export const isErrorCode = <T extends CodedErrorType = CodedErrorType>(
  code: string,
  t: T,
): code is ErrorCode<T> => ErrorTypeCodes[t].contains(code);

/**
 * Returns the error types, {@link ErrorType[]}, that a given code, {@link ErrorCode}, is associated
 * with.  Under most circumstances, this will just be a single error type, {@link ErrorType}.
 * However, there are or may be codes that are associated with multiple error types.
 *
 * @param {ErrorCode} code
 * @returns {CodedErrorType[]}
 */
export const getErrorTypes = (code: ErrorCode): CodedErrorType[] => {
  const errorTypes: CodedErrorType[] = CodedErrorTypes.__ALL__
    .slice()
    .reduce((prev: CodedErrorType[], curr: CodedErrorType) => {
      if (isErrorCode(code, curr)) {
        return [...prev, curr];
      }
      return prev;
    }, [] as Exclude<CodedErrorType, typeof CodedErrorTypes.NETWORK>[]);
  if (errorTypes.length === 0) {
    throw new Error(
      `The code ${code} is not associated with an error type - this should not happen, and ` +
        "means that there is a typing issue related to the codes.",
    );
  }
  return errorTypes;
};
