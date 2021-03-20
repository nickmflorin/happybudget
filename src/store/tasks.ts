import { SagaIterator } from "redux-saga";
import { put } from "redux-saga/effects";
import { forEach } from "lodash";

import { ClientError, handleRequestError } from "api";

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
