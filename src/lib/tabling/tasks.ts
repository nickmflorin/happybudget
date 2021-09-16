import { SagaIterator } from "redux-saga";
import { fork } from "redux-saga/effects";
import { isNil } from "lodash";

/* eslint-disable indent */
export const createChangeEventHandler = <
  R extends Table.RowData,
  M extends Model.Model = Model.Model,
  G extends Model.Group = Model.Group
>(
  handlers: Partial<Table.ChangeEventTaskMap<R, M, G>>
): Redux.Task<Table.ChangeEvent<R, M, G>> => {
  function* handleChangeEvent(action: Redux.Action<Table.ChangeEvent<R, M, G>>): SagaIterator {
    if (!isNil(action.payload)) {
      const event: Table.ChangeEvent<R, M, G> = action.payload;
      const handler = handlers[event.type];
      if (!isNil(handler)) {
        yield fork(handler, action as Redux.Action<any>);
      }
    }
  }
  return handleChangeEvent;
};
