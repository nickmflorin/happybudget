import { isNil, filter, map } from "lodash";

import { errors } from "lib";
import { ClientError, NetworkError } from "./errors";
import { standardizeError } from "./standardizer";

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
