import { filter, find, isNil } from "lodash";
import Cookies from "universal-cookie";

import * as errors from "./errors";

export const getRequestHeaders = (): { [key: string]: string } => {
  const headers: { [key: string]: string } = {};
  const cookies = new Cookies();
  /* The CSRF Token needs to be set as a header for POST/PATCH/PUT requests
     with Django - unfortunately, we cannot include it as a cookie only
     because their middleware looks for it in the headers. */
  let csrfToken: string = cookies.get("greenbudgetcsrftoken");
  if (process.env.REACT_APP_PRODUCTION_ENV === "local") {
    csrfToken = cookies.get("localgreenbudgetcsrftoken");
  }
  if (!isNil(csrfToken)) {
    headers["X-CSRFToken"] = csrfToken;
  }
  return headers;
};

export const setRequestHeaders = (request: XMLHttpRequest) => {
  const headers = getRequestHeaders();
  const keys = Object.keys(headers);
  for (let i = 0; i < keys.length; i++) {
    request.setRequestHeader(keys[i], headers[keys[i]]);
  }
};

export const filterPayload = <T extends Http.PayloadObj = Http.PayloadObj>(payload: T): T => {
  const newPayload: T = {} as T;
  Object.keys(payload).forEach((key: string) => {
    if (typeof payload === "object" && payload[key as keyof T] !== undefined) {
      newPayload[key as keyof T] = payload[key as keyof T];
    }
  });
  return newPayload;
};

export const parseErrors = (error: Http.IHttpClientError | Http.ErrorResponse | Http.Error[]): Http.Error[] => {
  return error instanceof errors.ClientError ? error.errors : Array.isArray(error) ? error : error.errors;
};

export const parseError = <T extends Http.Error>(
  error: Http.IHttpClientError | Http.ErrorResponse | Http.Error[],
  /* For field level errors, there will often be more than one error in the
     response. */
  error_type: "http" | "unknown" | "global" | "auth" | "billing" | "permission"
): T | null => {
  const filtered = filter(parseErrors(error), { error_type }) as T[];
  return filtered.length === 0 ? null : filtered[0];
};

export const parseFieldErrors = (
  error: Http.IHttpClientError | Http.ErrorResponse | Http.Error[]
): Http.FieldError[] => {
  return filter(parseErrors(error), { error_type: errors.ApiErrorTypes.FIELD }) as Http.FieldError[];
};

export const parseFieldError = (
  error: Http.IHttpClientError | Http.ErrorResponse | Http.Error[],
  field: string
): Http.FieldError | null => {
  const fieldErrors = parseFieldErrors(error);
  if (fieldErrors.length !== 0) {
    return find(fieldErrors, { field }) || null;
  }
  return null;
};

export const parseAuthError = (
  error: Http.IHttpClientError | Http.ErrorResponse | Http.Error[]
): Http.AuthError | null => parseError(error, errors.ApiErrorTypes.AUTH);

export const parseGlobalError = (
  error: Http.IHttpClientError | Http.ErrorResponse | Http.Error[]
): Http.GlobalError | null => parseError(error, errors.ApiErrorTypes.GLOBAL);

export const parseBillingError = (
  error: Http.IHttpClientError | Http.ErrorResponse | Http.Error[]
): Http.BillingError | null => parseError(error, errors.ApiErrorTypes.BILLING);

export const parsePermissionError = (
  error: Http.IHttpClientError | Http.ErrorResponse | Http.Error[]
): Http.PermissionError | null => parseError(error, errors.ApiErrorTypes.PERMISSION);

export const parseUnknownError = (
  error: Http.IHttpClientError | Http.ErrorResponse | Http.Error[]
): Http.UnknownError | null => parseError(error, errors.ApiErrorTypes.UNKNOWN);

export const parseHttpError = (
  error: Http.IHttpClientError | Http.ErrorResponse | Http.Error[]
): Http.HttpError | null => parseError(error, errors.ApiErrorTypes.HTTP);
