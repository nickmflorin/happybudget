declare namespace Http {
  type ErrorResponse = {
    readonly errors: Error[];
  };

  type ErrorType = "unknown" | "http" | "field" | "global" | "auth" | "billing" | "permission";

  type FileErrorCode = "invalid_file_name" | "invalid_file_extension";

  type GlobalErrorCode = "pdf_error" | "rate_limited" | "email_error";

  type PermissionErrorCode = "permission_error" | "product_permission_error";
  type BillingErrorCode = "stripe_request_error" | "checkout_error" | "checkout_session_inactive";

  type FieldErrorCode =
    | FileErrorCode
    | "unique"
    | "invalid"
    | "required"
    | "email_does_not_exist"
    | "invalid_credentials";

  type TokenErrorCode = "token_expired" | "token_not_valid";

  type AuthErrorCode =
    | TokenErrorCode
    | "account_not_on_waitlist"
    | "account_not_verified"
    | "account_disabled"
    | "account_not_authenticated"
    | "invalid_social_token"
    | "invalid_social_provider";

  type HttpErrorCode = "not_found";

  type UnknownErrorCode = "unknown";

  type ErrorCode =
    | AuthErrorCode
    | HttpErrorCode
    | UnknownErrorCode
    | FieldErrorCode
    | GlobalErrorCode
    | BillingErrorCode
    | PermissionErrorCode;

  interface IApiError<T extends ErrorType = ErrorType, C extends string = string> {
    readonly code: C;
    readonly message: string;
    readonly error_type: T;
  }

  interface IBaseError {
    // Properties we need to include to allow the classes to extend Error.
    readonly name: string;
    readonly message: string;
  }

  interface IHttpNetworkError extends IBaseError {
    readonly url?: string;
  }

  interface IHttpServerError extends IBaseError {
    readonly status: number;
    readonly url?: string;
  }

  interface IHttpClientError extends IBaseError {
    readonly url: string;
    readonly status: number;
    readonly response: import("axios").AxiosResponse<ErrorReponse>;
    readonly errors: Error[];
    readonly globalError: GlobalError | null;
    readonly authenticationError: AuthError | null;
    readonly billingError: BillingError | null;
    readonly httpError: HttpError | null;
    readonly permissionError: PermissionError | null;
    readonly unknownError: UnknownError | null;
    readonly fieldErrors: FieldError[];
  }

  type UnknownError = IApiError<"unknown", UnknownErrorCode>;
  type FieldError = IApiError<"field", FieldErrorCode> & {
    readonly field: string;
  };
  type GlobalError = IApiError<"global", GlobalErrorCode>;
  type HttpError = IApiError<"http", HttpErrorCode>;
  type AuthError = IApiError<"auth", AuthErrorCode> & {
    readonly user_id?: number;
  };
  type BillingError = IApiError<"billing", BillingErrorCode>;
  type PermissionError = IApiError<"permission", PermissionErrorCode> & {
    readonly products: Model.ProductId | "__all__";
  };

  type Error = HttpError | UnknownError | FieldError | GlobalError | AuthError | BillingError | PermissionError;
}
