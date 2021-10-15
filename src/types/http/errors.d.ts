namespace Http {
  type ErrorType = "unknown" | "http" | "field" | "global" | "auth";

  type FieldErrorCode =
    | "unique"
    | "invalid"
    | "required"
    | "email_does_not_exist"
    | "invalid_credentials"
    | "not_authenticated";
  type AuthErrorCode =
    | "email_not_verified"
    | "account_disabled"
    | "token_expired"
    | "token_not_valid"
    | "invalid_social_token"
    | "invalid_social_provider";
  type HttpErrorCode = "not_found";
  type UnknownErrorCode = "unknown";

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
    readonly forceLogout: boolean;
    readonly globalErrors: GlobalError[];
    readonly authenticationErrors: AuthError[];
    readonly httpErrors: HttpError[];
    readonly unknownErrors: UnknownError[];
    readonly fieldErrors: FieldError[];
  }

  type UnknownError = IApiError<"unknown", UnknownErrorCode>;
  type FieldError = IApiError<"field", FieldErrorCode> & {
    readonly field: string;
  };
  type GlobalError = IApiError<"global">;
  type HttpError = IApiError<"http", HttpErrorCode>;
  type AuthError = IApiError<"auth", AuthErrorCode> & {
    readonly force_logout?: boolean;
  };

  /* eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars */
  type Error = HttpError | UnknownError | FieldError | GlobalError | AuthError;

  /* eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars */
  type ErrorResponse = {
    /* eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars */
    errors: Http.Error[];
    [key: string]: any;
  };
}
