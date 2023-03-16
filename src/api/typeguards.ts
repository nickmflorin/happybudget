export const isResponseFieldError = (
  e: Http.ResponseError | Http.UnknownResponseError,
): e is Http.ResponseFieldError => (e as Http.ResponseFieldError).error_type === "field";

export const isResponseBillingError = (
  e: Http.ResponseError | Http.UnknownResponseError,
): e is Http.ResponseBillingError => (e as Http.ResponseBillingError).error_type === "billing";

export const isResponseAuthError = (
  e: Http.ResponseError | Http.UnknownResponseError,
): e is Http.ResponseAuthError => (e as Http.ResponseAuthError).error_type === "auth";

export const isResponsePermissionError = (
  e: Http.ResponseError | Http.UnknownResponseError,
): e is Http.ResponsePermissionError =>
  (e as Http.ResponsePermissionError).error_type === "permission";

export const isResponseHttpError = (
  e: Http.ResponseError | Http.UnknownResponseError,
): e is Http.ResponseHttpError => (e as Http.ResponseHttpError).error_type === "http";

export const isResponseBadRequestError = (
  e: Http.ResponseError | Http.UnknownResponseError,
): e is Http.ResponseBadRequestError =>
  (e as Http.ResponseBadRequestError).error_type === "bad_request";

export const isResponseFormError = (
  e: Http.ResponseError | Http.UnknownResponseError,
): e is Http.ResponseFormError => (e as Http.ResponseFormError).error_type === "form";
