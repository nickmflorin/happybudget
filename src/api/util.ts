import { isNil, forEach, find, filter, map } from "lodash";
import { toast } from "react-toastify";
import { replaceInArray } from "lib/util";

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

export const renderFieldErrorsInForm = (form: any, e: ClientError) => {
  let fieldsWithErrors: { name: string; errors: string[] }[] = [];
  forEach(parseFieldErrors(e), (error: Http.FieldError) => {
    const existing = find(fieldsWithErrors, { name: error.field });
    if (!isNil(existing)) {
      fieldsWithErrors = replaceInArray<{ name: string; errors: string[] }>(
        fieldsWithErrors,
        { name: error.field },
        { ...existing, errors: [...existing.errors, standardizeError(error).message] }
      );
    } else {
      fieldsWithErrors.push({ name: error.field, errors: [standardizeError(error).message] });
    }
  });
  form.setFields(fieldsWithErrors);
};

export type RequestErrorHandler = (error: string) => void;
export interface RequestErrorHandlers {
  client?: RequestErrorHandler;
  server?: RequestErrorHandler;
}

const isErrorHandlers = (handler: RequestErrorHandler | RequestErrorHandlers): handler is RequestErrorHandlers => {
  return (
    (handler as RequestErrorHandlers).client !== undefined || (handler as RequestErrorHandlers).server !== undefined
  );
};

export const handleRequestError = (e: Error, message = "", handler?: RequestErrorHandler | RequestErrorHandlers) => {
  const getHandler = (type: "client" | "server"): RequestErrorHandler | undefined => {
    if (!isNil(handler)) {
      if (isErrorHandlers(handler)) {
        if (!isNil(handler[type])) {
          return handler[type];
        }
        return undefined;
      }
      return handler;
    }
    return undefined;
  };

  const handle = (error: string, type: "client" | "server"): void => {
    const _handler = getHandler(type);
    if (!isNil(_handler)) {
      _handler(error);
    } else {
      toast.error(error);
    }
  };

  // TODO: Improve this - this most likely can be it's own saga (maybe even at the
  // global application level) that dispatches error messages to a queue.
  if (e instanceof ClientError) {
    /* eslint-disable no-console */
    console.error(e);
    const outputMessage = message === "" ? "There was a problem with your request." : message;
    handle(outputMessage, "client");
  } else if (e instanceof NetworkError) {
    handle("There was a problem communicating with the server.", "server");
  } else {
    throw e;
  }
};
