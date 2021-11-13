import { filter, find } from "lodash";

import * as errors from "./errors";

export const parseErrors = (error: Http.IHttpClientError | Http.ErrorResponse | Http.Error[]): Http.Error[] => {
  return error instanceof errors.ClientError ? error.errors : Array.isArray(error) ? error : error.errors;
};

export const parseError = <T extends Http.Error>(
  error: Http.IHttpClientError | Http.ErrorResponse | Http.Error[],
  /* For field level errors, there will often be more than one error in the
     response. */
  error_type: "http" | "unknown" | "global" | "auth" | "billing"
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

export const parseUnknownError = (
  error: Http.IHttpClientError | Http.ErrorResponse | Http.Error[]
): Http.UnknownError | null => parseError(error, errors.ApiErrorTypes.UNKNOWN);

export const parseHttpError = (
  error: Http.IHttpClientError | Http.ErrorResponse | Http.Error[]
): Http.HttpError | null => parseError(error, errors.ApiErrorTypes.HTTP);
