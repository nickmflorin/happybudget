import { isNil, filter, map, isMatch, reduce } from "lodash";

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

export const isHttpError = (error: Http.Error | any): error is Http.Error => {
  return (
    !isNil(error) &&
    (error as Http.Error).message !== undefined &&
    (error as Http.Error).code !== undefined &&
    (error as Http.Error).error_type !== undefined
  );
};

export const parseErrors = (error: ClientError | Http.ErrorResponse | Http.Error[]): Http.Error[] => {
  return error instanceof ClientError ? error.errors : Array.isArray(error) ? error : error.errors;
};

export const parseFieldErrors = (error: ClientError | Http.ErrorResponse | Http.Error[]): Http.FieldError[] => {
  return map(filter(parseErrors(error), { error_type: "field" }) as Http.FieldError[], (e: Http.FieldError) =>
    standardizeError(e)
  );
};

export const parseAuthError = (error: ClientError | Http.ErrorResponse | Http.Error[]): Http.AuthError | null => {
  const e = filter(parseErrors(error), { error_type: "auth" }) as Http.AuthError[];
  return e.length === 0 ? null : standardizeError(e[0]); // There will only ever be 1 auth error in a given response.
};

export const parseGlobalError = (error: ClientError | Http.ErrorResponse | Http.Error[]): Http.GlobalError | null => {
  const e = filter(parseErrors(error), { error_type: "global" }) as Http.GlobalError[];
  return e.length === 0 ? null : standardizeError(e[0]); // There will only ever be 1 global error in a given response.
};

export const handleRequestError = (e: Error, message = "") => {
  // TODO: Improve this - this most likely can be it's own saga (maybe even at the
  // global application level) that dispatches error messages to a queue.
  if (e instanceof ClientError) {
    errors.silentFail({
      message: message === "" ? "There was a problem with your request." : message,
      error: e
    });
  } else if (e instanceof NetworkError) {
    errors.silentFail({
      message: "There was a problem communicating with the server.",
      error: e
    });
  } else {
    throw e;
  }
};
