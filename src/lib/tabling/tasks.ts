import { SagaIterator } from "redux-saga";
import { call } from "redux-saga/effects";
import { isNil } from "lodash";

/* eslint-disable indent */
export const createChangeEventHandler = <
  R extends Table.RowData,
  M extends Model.TypedHttpModel = Model.TypedHttpModel
>(
  handlers: Partial<Redux.TableEventTaskMapObject<R, M>>
): Redux.TableEventTask<Table.ChangeEvent<R, M>> => {
  function* handleChangeEvent(e: Table.ChangeEvent<R, M>): SagaIterator {
    // Table reordering is only pertinent to the reducers.  It is an event dispatched
    // from the tasks to the reducer - at least right now.
    if (e.type !== "tableOrderChanged") {
      const handler = handlers[e.type] as Redux.TableEventTask<Table.ChangeEvent<R, M>, R, M> | undefined;
      // Do not issue a warning/error if the event type does not have an associated
      // handler because there are event types that correspond to reducer behavior
      // only.
      if (!isNil(handler)) {
        yield call(handler, e);
      }
    }
  }
  return handleChangeEvent;
};
