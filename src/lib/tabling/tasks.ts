import { SagaIterator } from "redux-saga";
import { fork } from "redux-saga/effects";
import { isNil } from "lodash";

/* eslint-disable indent */
export const createChangeEventHandler = <R extends Table.RowData, M extends Model.HttpModel = Model.HttpModel>(
  handlers: Partial<Table.ChangeEventTaskMap<R, M>>
): Redux.Task<Table.ChangeEvent<R, M>> => {
  function* handleChangeEvent(action: Redux.Action<Table.ChangeEvent<R, M>>): SagaIterator {
    if (!isNil(action.payload)) {
      const event: Table.ChangeEvent<R, M> = action.payload;
      const handler = handlers[event.type];
      if (!isNil(handler)) {
        yield fork(handler, action as Redux.Action<any>);
      }
    }
  }
  return handleChangeEvent;
};
