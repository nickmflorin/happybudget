import { reduce } from "lodash";

import * as typeguards from "./typeguards";

export const AuthErrorCodes: { [key: string]: Http.AuthErrorCode } = {
  TOKEN_EXPIRED: "token_expired",
  TOKEN_INVALID: "token_not_valid",
  INVALID_SOCIAL_TOKEN: "invalid_social_token",
  INVALID_SOCIAL_PROVIDER: "invalid_social_provider",
  ACCOUNT_NOT_VERIFIED: "account_not_verified",
  ACCOUNT_DISABLED: "account_disabled",
  ACCOUNT_NOT_ON_WAITLIST: "account_not_on_waitlist",
  NOT_AUTHENTICATED: "account_not_authenticated"
};

export const PermissionErrorCodes: { [key: string]: Http.PermissionErrorCode } = {
  PERMISSION_ERROR: "permission_error",
  SUBSCRIPTION_PERMISSION_ERROR: "subscription_permission_error"
};

export const BillingErrorCodes: { [key: string]: Http.BillingErrorCode } = {
  STRIPE_REQUEST_ERROR: "stripe_request_error",
  CHECKOUT_ERROR: "checkout_error",
  CHECKOUT_SESSION_INACTIVE: "checkout_session_inactive"
};

export const FieldErrorCodes: { [key: string]: Http.FieldErrorCode } = {
  EMAIL_DOES_NOT_EXIST: "email_does_not_exist",
  INVALID_CREDENTIALS: "invalid_credentials",
  UNIQUE: "unique",
  INVALID: "invalid",
  REQUIRED: "required",
  INVALID_FILE_NAME: "invalid_file_name",
  INVALID_FILE_EXTENSION: "invalid_file_extension"
};

export const GlobalErrorCodes: { [key: string]: Http.GlobalErrorCode } = {
  PDF_ERROR: "pdf_error",
  RATE_LIMITED: "rate_limited"
};

export const HttpErrorCodes: { [key: string]: Http.HttpErrorCode } = {
  NOT_FOUND: "not_found"
};

export const UnknownErrorCodes: { [key: string]: Http.UnknownErrorCode } = {
  UNKNOWN: "unknown"
};

export const ErrorCodes: { [key: string]: Http.ErrorCode } = {
  ...AuthErrorCodes,
  ...GlobalErrorCodes,
  ...FieldErrorCodes,
  ...HttpErrorCodes,
  ...UnknownErrorCodes,
  ...PermissionErrorCodes,
  ...BillingErrorCodes
};

type ErrorStandard<T extends Http.Error> = {
  readonly typeguard: (e: Http.Error) => e is T;
  readonly filter?: (e: T) => boolean;
  readonly func: (e: T) => T;
  readonly code?: T["code"];
};

/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
const ErrorStandards: ErrorStandard<any>[] = [
  {
    typeguard: typeguards.isFieldError,
    code: FieldErrorCodes.UNIQUE,
    func: (e: Http.FieldError) => ({ ...e, message: `The field ${e.field} must be unique.` })
  },
  {
    typeguard: typeguards.isFieldError,
    code: FieldErrorCodes.REQUIRED,
    func: (e: Http.FieldError) => ({ ...e, message: `The field ${e.field} is required.` })
  }
];

export const standardizeError = <T extends Http.Error>(e: T) =>
  reduce(
    ErrorStandards,
    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
    (curr: T, s: ErrorStandard<any>): T => {
      if (s.typeguard(e)) {
        if (s.code !== undefined && curr.code !== s.code) {
          return curr;
        } else if (s.filter !== undefined && s.filter(e) !== true) {
          return curr;
        }
        return s.func(e);
      }
      return curr;
    },
    e
  );

export const standardizedErrorMessage = <T extends Http.Error>(error: T) => standardizeError(error).message;
