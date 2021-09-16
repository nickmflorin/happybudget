import { Saga, SagaIterator } from "redux-saga";
import { spawn, take, call, cancel, actionChannel } from "redux-saga/effects";
import { isNil } from "lodash";

/* eslint-disable indent */
export const createTableSaga = <
  R extends Table.RowData,
  M extends Model.HttpModel = Model.HttpModel,
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
  M extends Model.HttpModel = Model.HttpModel,
  A extends Redux.AuthenticatedTableActionMap<R, M> = Redux.AuthenticatedTableActionMap<R, M>
>(
  config: Table.SagaConfig<R, M, A>
): Saga => {
  return createTableSaga<R, M, A>(config);
};

/* eslint-disable indent */
export const createAuthenticatedTableSaga = <
  R extends Table.RowData,
  M extends Model.HttpModel = Model.HttpModel,
  A extends Redux.AuthenticatedTableActionMap<R, M> = Redux.AuthenticatedTableActionMap<R, M>
>(
  config: Table.SagaConfig<R, M, A>
): Saga => {
  function* tableChangeEventSaga(): SagaIterator {
    // TODO: We probably want a way to prevent duplicate events that can cause
    // backend errors from occurring.  This would include things like trying to
    // delete the same row twice.
    const changeChannel = yield actionChannel(config.actions.tableChanged.toString());
    while (true) {
      const action: Redux.Action<Table.ChangeEvent<R, M>> = yield take(changeChannel);
      // Blocking call so that table changes happen sequentially.
      yield call(config.tasks.handleChangeEvent, action);
    }
  }

  const baseTableSaga = createTableSaga<R, M, A>(config);

  function* rootSaga(): SagaIterator {
    yield spawn(baseTableSaga);
    yield spawn(tableChangeEventSaga);
  }
  return rootSaga;
};
