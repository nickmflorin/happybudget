import { SagaIterator } from "redux-saga";
import { call } from "redux-saga/effects";
import { isNil } from "lodash";

/* eslint-disable indent */
export const createChangeEventHandler = <R extends Table.RowData, M extends Model.RowHttpModel = Model.RowHttpModel>(
  handlers: Partial<Redux.TableEventTaskMapObject<R, M>>
): Redux.TableEventTask<Table.ChangeEvent<R, M>> => {
  function* handleChangeEvent(e: Table.ChangeEvent<R, M>): SagaIterator {
    const handler = handlers[e.type] as Redux.TableEventTask<Table.ChangeEvent<R, M>, R, M> | undefined;
    // Do not issue a warning/error if the event type does not have an associated
    // handler because there are event types that correspond to reducer behavior
    // only.
    if (!isNil(handler)) {
      yield call(handler, e);
    }
  }
  return handleChangeEvent;
};
