import { SagaIterator } from "redux-saga";
import { fork } from "redux-saga/effects";
import { isNil } from "lodash";

import { tabling } from "lib";

/* eslint-disable indent */
export const createChangeEventHandler = <
  R extends Table.RowData,
  M extends Model.TypedHttpModel = Model.TypedHttpModel
>(
  handlers: Partial<Table.ChangeEventTaskMap<R>>
): Redux.Task<Table.ChangeEvent<R, M>> => {
  function* handleChangeEvent(action: Redux.Action<Table.ChangeEvent<R, M>>): SagaIterator {
    if (!isNil(action.payload)) {
      const event: Table.ChangeEvent<R, M> = action.payload;
      if (!tabling.typeguards.isModelUpdatedEvent(event)) {
        const handler = handlers[event.type];
        if (!isNil(handler)) {
          yield fork(handler, action as Redux.Action<any>);
        }
      }
    }
  }
  return handleChangeEvent;
};
