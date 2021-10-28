namespace Http {
  type ErrorType = "unknown" | "http" | "field" | "global" | "auth";

  type FileErrorCode = "invalid_file_name" | "invalid_file_extension";

  type GlobalErrorCode = FileErrorCode | "pdf_error" | "rate_limited";

  type FieldErrorCode =
    | "unique"
    | "invalid"
    | "required"
    | "email_does_not_exist"
    | "invalid_credentials";

  type TokenErrorCode = "token_expired" | "token_not_valid";

  type AuthErrorCode =
    | TokenErrorCode
    | "email_not_verified"
    | "account_disabled"
    | "account_not_authenticated"
    | "invalid_social_token"
    | "invalid_social_provider";

  type HttpErrorCode = "not_found";

  type UnknownErrorCode = "unknown";

  /* eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars */
  type ErrorCode = AuthErrorCode | HttpErrorCode | UnknownErrorCode | FieldErrorCode | GlobalErrorCode

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

  /* eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars */
  interface IHttpNetworkError extends IBaseError {
    readonly url?: string;
  }

  /* eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars */
  interface IHttpServerError extends IBaseError {
    readonly status: number;
    readonly url?: string;
  }

  /* eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars */
  interface IHttpClientError extends IBaseError {
    readonly url: string;
    readonly status: number;
    readonly response: import("axios").AxiosResponse<any>;
    readonly errors: Http.Error[];
    readonly userId?: number;
    readonly globalError: GlobalError | null;
    readonly authenticationError: AuthError | null;
    readonly httpError: HttpError | null;
    readonly unknownError: UnknownError | null;
    readonly fieldErrors: FieldError[];
  }

  type UnknownError = IApiError<"unknown", UnknownErrorCode>;
  type FieldError = IApiError<"field", FieldErrorCode> & {
    readonly field: string;
  };
  type GlobalError = IApiError<"global", GlobalErrorCode>;
  type HttpError = IApiError<"http", HttpErrorCode>;
  type AuthError = IApiError<"auth", AuthErrorCode>;

  /* eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars */
  type Error = HttpError | UnknownError | FieldError | GlobalError | AuthError;
}
