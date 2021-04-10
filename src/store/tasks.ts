import { SagaIterator } from "redux-saga";
import { put } from "redux-saga/effects";
import { forEach, isNil } from "lodash";

import { ClientError, handleRequestError, parseGlobalError, parseFieldErrors } from "api";
import { DISPLAY_ERRORS_IN_TABLE } from "config";

export function* handleTableErrors(
  e: Error,
  message: string,
  id: number,
  action: (errors: Table.CellError[]) => Redux.IAction<any>
): SagaIterator {
  if (e instanceof ClientError) {
    const global = parseGlobalError(e);
    if (!isNil(global)) {
      handleRequestError(e, global.message);
    }
    const cellErrors: Table.CellError[] = [];
    forEach(parseFieldErrors(e), (error: Http.FieldError) => {
      cellErrors.push({
        id: id,
        error: error.message,
        field: error.field
      });
    });
    if (cellErrors.length === 0) {
      handleRequestError(e, message);
    } else {
      /* @ts-ignore 2367 */
      if (DISPLAY_ERRORS_IN_TABLE === true) {
        yield put(action(cellErrors));
      } else {
        handleRequestError(e, message);
      }
    }
  } else {
    handleRequestError(e, message);
  }
}
