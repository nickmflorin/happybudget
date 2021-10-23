import { isMatch, reduce, filter } from "lodash";

import { errors } from "lib";
import { ClientError, NetworkError } from "./errors";

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
    (error: Http.Error) => error.error_type === "field" && error.code === "unique",
    (error: Http.FieldError) => ({ ...error, message: `The field ${error.field} must be unique.` })
  )
];

export const standardizeError = <T extends Http.IApiError<any> = Http.IApiError<any>>(error: T) => {
  return reduce(STANDARDS, (e: T, standard) => standard(e), error);
};

export const parseErrors = (error: Http.IHttpClientError | Http.ErrorResponse | Http.Error[]): Http.Error[] => {
  return error instanceof ClientError ? error.errors : Array.isArray(error) ? error : error.errors;
};

export const parseFieldErrors = (
  error: Http.IHttpClientError | Http.ErrorResponse | Http.Error[]
): Http.FieldError[] => {
  return filter(parseErrors(error), { error_type: "field" }) as Http.FieldError[];
};

export const parseAuthErrors = (error: Http.IHttpClientError | Http.ErrorResponse | Http.Error[]): Http.AuthError[] =>
  filter(parseErrors(error), { error_type: "auth" }) as Http.AuthError[];

export const parseGlobalErrors = (
  error: Http.IHttpClientError | Http.ErrorResponse | Http.Error[]
): Http.GlobalError[] => filter(parseErrors(error), { error_type: "global" }) as Http.GlobalError[];

export const parseUnknownErrors = (
  error: Http.IHttpClientError | Http.ErrorResponse | Http.Error[]
): Http.UnknownError[] => filter(parseErrors(error), { error_type: "unknown" }) as Http.UnknownError[];

export const parseHttpErrors = (error: Http.IHttpClientError | Http.ErrorResponse | Http.Error[]): Http.HttpError[] =>
  filter(parseErrors(error), { error_type: "http" }) as Http.HttpError[];

export const handleRequestError = (e: Error, message = "") => {
  if (e instanceof ClientError) {
    errors.warn(message || "There was a problem with your request.", {
      error: e,
      notifyUser: true,
      dispatchToSentry: false
    });
  } else if (e instanceof NetworkError) {
    errors.error(message || "There was a problem communicating with the server.", {
      error: e,
      notifyUser: true,
      dispatchToSentry: true
    });
  } else {
    throw e;
  }
};
