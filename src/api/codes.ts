import { isMatch, reduce } from "lodash";

export const AuthErrorCodes: { [key: string]: Http.AuthErrorCode } = {
  TOKEN_EXPIRED: "token_expired",
  TOKEN_INVALID: "token_not_valid",
  INVALID_SOCIAL_TOKEN: "invalid_social_token",
  INVALID_SOCIAL_PROVIDER: "invalid_social_provider",
  ACCOUNT_NOT_VERIFIED: "account_not_verified",
  ACCOUNT_DISABLED: "account_disabled",
  ACCOUNT_NOT_APPROVED: "account_not_approved",
  ACCOUNT_NOT_ON_WAITLIST: "account_not_on_waitlist",
  NOT_AUTHENTICATED: "account_not_authenticated"
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
  ...UnknownErrorCodes
};

export type ErrorFilter = ((error: Http.Error) => boolean) | { [key: string]: any };
export type ErrorStandardizer<T> = (error: T) => T;

const testError = (filt: ErrorFilter, error: Http.Error): boolean =>
  typeof filt === "function" ? filt(error) : isMatch(error, filt);

/* prettier-ignore */
export const Standard =
  <T extends Http.Error = Http.Error>(f: ErrorFilter, standardizer: ErrorStandardizer<T>): ErrorStandardizer<T> =>
    (error: T): T => {
      if (testError(f, error)) {
        return standardizer(error);
      }
      return error;
    };

export const STANDARDS: ErrorStandardizer<any>[] = [
  Standard<Http.FieldError>(
    (error: Http.Error) => error.error_type === "field" && error.code === ErrorCodes.UNIQUE,
    (error: Http.FieldError) => ({ ...error, message: `The field ${error.field} must be unique.` })
  ),
  Standard<Http.FieldError>(
    (error: Http.Error) => error.error_type === "field" && error.code === ErrorCodes.REQUIRED,
    (error: Http.FieldError) => ({ ...error, message: `The field ${error.field} is required.` })
  )
];

export const standardizeError = <T extends Http.Error = Http.Error>(error: T) => {
  return reduce(STANDARDS, (e: T, standard) => standard(e), error);
};

export const standardizedErrorMessage = <T extends Http.Error = Http.Error>(error: T) =>
  standardizeError(error).message;
