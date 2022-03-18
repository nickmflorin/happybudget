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
  PRODUCT_PERMISSION_ERROR: "product_permission_error"
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
  BAD_REQUEST: "bad_request",
  EMAIL_ERROR: "email_error"
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
