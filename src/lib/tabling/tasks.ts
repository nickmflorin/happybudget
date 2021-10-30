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
    const handler = handlers[e.type];
    if (!isNil(handler)) {
      yield call(handler, e);
    } else {
      console.error(`Received unexpected event type ${e.type}!`);
    }
  }
  return handleChangeEvent;
};
