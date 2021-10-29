import { Saga, SagaIterator } from "redux-saga";
import { spawn, take, call, cancel, actionChannel, delay, fork, flush } from "redux-saga/effects";
import { isNil, map } from "lodash";

import { tabling } from "lib";

/* eslint-disable indent */
export const createTableSaga = <
  R extends Table.RowData,
  M extends Model.TypedHttpModel = Model.TypedHttpModel,
  A extends Redux.AuthenticatedTableActionMap<R, M> = Redux.AuthenticatedTableActionMap<R, M>
>(
  config: Table.SagaConfig<R, M, A>
): Saga => {
  function* requestSaga(): SagaIterator {
    let lastTasks;
    if (!isNil(config.actions.request)) {
      while (true) {
        const action = yield take(config.actions.request.toString());
        if (lastTasks) {
          yield cancel(lastTasks);
        }
        lastTasks = yield call(config.tasks.request, action);
      }
    }
  }

  function* rootSaga(): SagaIterator {
    yield spawn(requestSaga);
  }
  return rootSaga;
};

export const createUnauthenticatedTableSaga = <
  R extends Table.RowData,
  M extends Model.TypedHttpModel = Model.TypedHttpModel,
  A extends Redux.AuthenticatedTableActionMap<R, M> = Redux.AuthenticatedTableActionMap<R, M>
>(
  config: Table.SagaConfig<R, M, A>
): Saga => {
  return createTableSaga<R, M, A>(config);
};

/* eslint-disable indent */
export const createAuthenticatedTableSaga = <
  R extends Table.RowData,
  M extends Model.TypedHttpModel = Model.TypedHttpModel,
  A extends Redux.AuthenticatedTableActionMap<R, M> = Redux.AuthenticatedTableActionMap<R, M>
>(
  config: Table.SagaConfig<R, M, A>
): Saga => {
  function* tableChangeEventSaga(): SagaIterator {
    const changeChannel = yield actionChannel(config.actions.tableChanged.toString());
    try {
      while (true) {
        const action = yield take(changeChannel);
        const e: Table.ChangeEvent<R, M> = action.payload;
        if (!tabling.typeguards.isDataChangeEvent(e)) {
          yield fork(config.tasks.handleChangeEvent, action);
        } else {
          // Buffer and flush data change events that occur every 500ms - this is particularly
          // important for dragging cell values to update other cell values as it submits a
          // separate DataChangeEvent for every new cell value.
          yield delay(500);
          const actions: Redux.Action<Table.DataChangeEvent<R>>[] = yield flush(changeChannel);
          const events: Table.DataChangeEvent<R>[] = map(
            [action as Redux.Action<Table.DataChangeEvent<R>>, ...actions],
            /* eslint-disable-next-line no-loop-func */
            (a: Redux.Action<Table.DataChangeEvent<R>>) => a.payload
          );
          const event = tabling.events.consolidateDataChangeEvents(events);
          if (!Array.isArray(event.payload) || event.payload.length !== 0) {
            yield fork(config.tasks.handleChangeEvent, {
              type: config.actions.tableChanged.toString(),
              payload: event
            });
          }
        }
      }
    } finally {
      const actions = yield flush(changeChannel);
      if (actions.length !== 0) {
        const events: Table.DataChangeEvent<R>[] = map(
          actions,
          /* eslint-disable-next-line no-loop-func */
          (a: Redux.Action<Table.DataChangeEvent<R>>) => a.payload
        );
        const event = tabling.events.consolidateDataChangeEvents(events);
        if (!Array.isArray(event.payload) || event.payload.length !== 0) {
          yield fork(config.tasks.handleChangeEvent, {
            type: config.actions.tableChanged.toString(),
            payload: event
          });
        }
      }
    }
  }

  const baseTableSaga = createTableSaga<R, M, A>(config);

  function* rootSaga(): SagaIterator {
    yield spawn(baseTableSaga);
    yield spawn(tableChangeEventSaga);
  }
  return rootSaga;
};
