import { isNil, map, forEach } from "lodash";
import { toast } from "react-toastify";

import { ClientError, NetworkError } from "./errors";

export const renderFieldErrorsInForm = (form: any, e: ClientError) => {
  const fieldsWithErrors: { name: string; errors: string[] }[] = [];
  forEach(e.errors, (errors: Http.IErrorDetail[], field: string) => {
    fieldsWithErrors.push({
      name: field,
      errors: map(errors, (error: Http.IErrorDetail) => error.message)
    });
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

/**
 * A utility method to be used from within sagas to provide common logic that
 * gets executed when an HTTP error is encountered.
 *
 * @param e        The Error that was caught during a request.
 * @param message  The default message to display.
 */
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
