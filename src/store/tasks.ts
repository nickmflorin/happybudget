import { toast } from "react-toastify";
import { SagaIterator } from "redux-saga";
import { put } from "redux-saga/effects";
import { forEach } from "lodash";

import { ClientError, NetworkError } from "api";

/**
 * A utility method to be used from within sagas to provide common logic that
 * gets executed when an HTTP error is encountered.
 *
 * @param e        The Error that was caught during a request.
 * @param message  The default message to display.
 */
export const handleRequestError = (e: Error, message = "") => {
  // TODO: Improve this - this most likely can be it's own saga (maybe even at the
  // global application level) that dispatches error messages to a queue.
  if (e instanceof ClientError) {
    /* eslint-disable no-console */
    console.error(e);
    const outputMessage = message === "" ? "There was a problem with your request." : message;
    toast.error(outputMessage);
  } else if (e instanceof NetworkError) {
    toast.error("There was a problem communicating with the server.");
  } else {
    throw e;
  }
};

export function* handleTableErrors(
  e: Error,
  message: string,
  id: number,
  action: (errors: Table.ICellError[]) => Redux.IAction<any>
): SagaIterator {
  if (e instanceof ClientError) {
    const cellErrors: Table.ICellError[] = [];
    forEach(e.errors, (errors: Http.IErrorDetail[], field: string) => {
      cellErrors.push({
        id: id,
        // TODO: We might want to build in a way to capture multiple errors for the cell.
        error: errors[0].message,
        // TODO: Should we make sure the field exists as a cell?  Instead of force
        // coercing here?
        field: field
      });
    });
    if (cellErrors.length === 0) {
      handleRequestError(e, message);
    } else {
      yield put(action(cellErrors));
    }
  } else {
    handleRequestError(e, message);
  }
}
