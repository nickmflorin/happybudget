import { Saga, SagaIterator } from "redux-saga";
import { spawn, take, call, cancel, actionChannel } from "redux-saga/effects";
import { isNil } from "lodash";

import * as typeguards from "./typeguards";

/* eslint-disable indent */
export const createTableSaga = <
  R extends Table.RowData,
  M extends Model.Model = Model.Model,
  T extends Redux.TableTaskMap<R, M> = Redux.TableTaskMap<R, M>,
  A extends Redux.AuthenticatedTableActionMap<R, M> = Redux.AuthenticatedTableActionMap<R, M>
>(
  config: Table.SagaConfig<R, M, T, A>
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
  M extends Model.Model = Model.Model,
  T extends Redux.TableTaskMap<R, M> = Redux.TableTaskMap<R, M>,
  A extends Redux.AuthenticatedTableActionMap<R, M> = Redux.AuthenticatedTableActionMap<R, M>
>(
  config: Table.SagaConfig<R, M, T, A>
): Saga => {
  return createTableSaga<R, M, T, A>(config);
};

const isTableTaskMapWithGroups = <R extends Table.RowData, M extends Model.Model = Model.Model>(
  t: Redux.TaskMapObject<Redux.TableTaskMap<R, M>> | Redux.TaskMapObject<Redux.TableTaskMapWithGroups<R, M>>
): t is Redux.TaskMapObject<Redux.TableTaskMapWithGroups<R, M>> =>
  (t as Redux.TaskMapObject<Redux.TableTaskMapWithGroups<R, M>>).handleAddRowToGroupEvent !== undefined;

/* eslint-disable indent */
export const createAuthenticatedTableSaga = <
  R extends Table.RowData,
  M extends Model.Model = Model.Model,
  G extends Model.Group = Model.Group,
  T extends Redux.TableTaskMap<R, M> = Redux.TableTaskMap<R, M>,
  A extends Redux.AuthenticatedTableActionMap<R, M, G> = Redux.AuthenticatedTableActionMap<R, M, G>
>(
  config: Table.SagaConfig<R, M, T, A>
): Saga => {
  function* tableChangeEventSaga(): SagaIterator {
    // TODO: We probably want a way to prevent duplicate events that can cause
    // backend errors from occurring.  This would include things like trying to
    // delete the same row twice.
    const changeChannel = yield actionChannel(config.actions.tableChanged.toString());
    while (true) {
      const action: Redux.Action<Table.ChangeEvent<R, M>> = yield take(changeChannel);
      if (!isNil(action.payload)) {
        const event: Table.ChangeEvent<R, M> = action.payload;
        if (typeguards.isDataChangeEvent(event)) {
          // Blocking call so that table changes happen sequentially.
          yield call(config.tasks.handleDataChangeEvent, action as Redux.Action<Table.DataChangeEvent<R, M>>);
        } else if (typeguards.isRowAddEvent(event)) {
          // If the event is artificial, we are submitting it from inside a task - so we do not want
          // to trigger a subsequent task because it will lead to a recursion.
          const payload: Table.RowAddEvent<R, M> = (action as Redux.Action<Table.RowAddEvent<R, M>>).payload;
          if (payload.artificial !== true) {
            yield call(config.tasks.handleRowAddEvent, action as Redux.Action<Table.RowAddEvent<R, M>>);
          }
        } else if (typeguards.isRowDeleteEvent(event)) {
          // Blocking call so that table changes happen sequentially.
          yield call(config.tasks.handleRowDeleteEvent, action as Redux.Action<Table.RowDeleteEvent<R, M>>);
        } else if (isTableTaskMapWithGroups(config.tasks)) {
          if (typeguards.isRowAddToGroupEvent(event)) {
            // Blocking call so that table changes happen sequentially.
            yield call(config.tasks.handleAddRowToGroupEvent, action as Redux.Action<Table.RowAddToGroupEvent<R, M>>);
          } else if (typeguards.isRowRemoveFromGroupEvent(event)) {
            // Blocking call so that table changes happen sequentially.
            yield call(
              config.tasks.handleRemoveRowFromGroupEvent,
              action as Redux.Action<Table.RowRemoveFromGroupEvent<R, M>>
            );
          } else if (typeguards.isGroupDeleteEvent(event)) {
            // Blocking call so that table changes happen sequentially.
            yield call(config.tasks.handleDeleteGroupEvent, action as Redux.Action<Table.GroupDeleteEvent>);
          }
        }
      }
    }
  }

  const baseTableSaga = createTableSaga<R, M, T, A>(config);

  function* rootSaga(): SagaIterator {
    yield spawn(baseTableSaga);
    yield spawn(tableChangeEventSaga);
  }
  return rootSaga;
};
