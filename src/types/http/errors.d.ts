declare namespace Http {
  type ErrorResponse = {
    readonly errors: ResponseError[];
  };

  type IRequestError = {
    readonly message: string;
    readonly name: string;
    readonly url: string;
  };

  type IClientError<
    E extends Http.ResponseError | Http.UnknownResponseError = Http.ResponseError | Http.UnknownResponseError
  > = IRequestError & {
    readonly status: number;
    readonly errorType: ResponseErrorType;
    readonly errors: Omit<E, "error_type">[];
    readonly userFacingMessage: string;
  };

  type ISingularClientError<
    E extends Http.ResponseError | Http.UnknownResponseError = Http.ResponseError | Http.UnknownResponseError
  > = IClientError<E> & {
    readonly code: E["code"];
    readonly error: Omit<E, "error_type">;
  };

  type IAuthenticationError = ISingularClientError<Http.ResponseAuthError> & {
    readonly userId: number | undefined;
  };
  type IPermissionError = ISingularClientError<Http.ResponsePermissionError>;
  type IBillingError = ISingularClientError<Http.ResponseBillingError>;
  type IBadRequestError = ISingularClientError<Http.ResponseBadRequestError>;
  type IHttpError = ISingularClientError<Http.ResponseHttpError>;
  type IFormError = ISingularClientError<Http.ResponseFormError>;
  type IFieldsError = IClientError<Http.ResponseFieldError> & {
    readonly getError: (field: string) => Omit<ResponseFieldError, "error_type"> | null;
  };
  type IUnknownError = IClientError<Http.UnknownResponseError>;
  type IError =
    | IAuthenticationError
    | IPermissionError
    | IBillingError
    | IHttpError
    | IFormError
    | IFieldsError
    | IUnknownError;

  type INetworkError = IRequestError;
  type IServerError = IRequestError & {
    readonly status: number;
  };

  type IApiError<
    E extends Http.ResponseError | Http.UnknownResponseError = Http.ResponseError | Http.UnknownResponseError
  > = IClientError<E> | IServerError | INetworkError;

  type ApiError<
    E extends Http.ResponseError | Http.UnknownResponseError = Http.ResponseError | Http.UnknownResponseError
  > = import("api/errors").ClientError<E> | import("api/errors").ServerError | import("api/errors").NetworkError;

  type BadRequestErrorCode = "bad_request";
  type PermissionErrorCode = "permission_error" | "product_permission_error";
  type BillingErrorCode = "stripe_request_error" | "checkout_error" | "checkout_session_inactive";

  type FormErrorCode = "invalid" | "unique" | "required";

  type FieldErrorCode =
    | FormErrorCode
    | "invalid_file_name"
    | "invalid_file_extension"
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

  type HttpErrorCode = "not_found" | "method_not_allowed";

  type UnknownErrorCode = "unknown";

  type ErrorCode =
    | AuthErrorCode
    | HttpErrorCode
    | BillingErrorCode
    | BadRequestErrorCode
    | FieldErrorCode
    | FormErrorCode
    | UnknownErrorCode
    | PermissionErrorCode;

  type ResponseErrorType = "unknown" | "http" | "field" | "form" | "auth" | "billing" | "permission" | "bad_request";

  type ErrorCodeMap = {
    readonly http: HttpErrorCode;
    readonly auth: AuthErrorCode;
    readonly billing: BillingErrorCode;
    readonly bad_request: BadRequestErrorCode;
    readonly form: FormErrorCode;
    readonly field: FieldErrorCode;
    readonly permission: PermissionErrorCode;
    readonly unknown: UnknownErrorCode;
  };

  type ErrorCodeLookup<T extends keyof ErrorCodeMap> = ErrorCodeMap[T];

  interface IApiResponseError<T extends ResponseErrorType, C extends ErrorCode> {
    readonly code: C;
    readonly message: string;
    readonly error_type: T;
  }

  type ResponseFieldError = IApiResponseError<"field", FieldErrorCode> & {
    readonly field: string;
  };
  type ResponseFormError = IApiResponseError<"form", FormErrorCode>;
  type ResponseHttpError = IApiResponseError<"http", HttpErrorCode>;
  type ResponseBadRequestError = IApiResponseError<"bad_request", BadRequestErrorCode>;
  type ResponseAuthError = IApiResponseError<"auth", AuthErrorCode> & {
    readonly user_id?: number;
  };
  type ResponseBillingError = IApiResponseError<"billing", BillingErrorCode>;
  type ResponsePermissionError = IApiResponseError<"permission", PermissionErrorCode> & {
    readonly products: Model.ProductId | "__all__";
  };

  type UnknownResponseError = IApiResponseError<"unknown", UnknownErrorCode>;

  type ResponseError =
    | ResponseHttpError
    | ResponseFormError
    | ResponseFieldError
    | ResponseAuthError
    | ResponseBillingError
    | ResponsePermissionError
    | ResponseBadRequestError;
}
