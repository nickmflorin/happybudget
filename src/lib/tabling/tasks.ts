import { SagaIterator } from "redux-saga";
import { fork } from "redux-saga/effects";
import { isNil } from "lodash";

/* eslint-disable indent */
export const createChangeEventHandler = <R extends Table.RowData>(
  handlers: Partial<Table.ChangeEventTaskMap<R>>
): Redux.Task<Table.ChangeEvent<R>> => {
  function* handleChangeEvent(action: Redux.Action<Table.ChangeEvent<R>>): SagaIterator {
    if (!isNil(action.payload)) {
      const event: Table.ChangeEvent<R> = action.payload;
      const handler = handlers[event.type];
      if (!isNil(handler)) {
        yield fork(handler, action as Redux.Action<any>);
      }
    }
  }
  return handleChangeEvent;
};
