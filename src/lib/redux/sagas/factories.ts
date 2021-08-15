import { SagaIterator } from "redux-saga";
import { spawn, take, call, cancel, actionChannel } from "redux-saga/effects";
import { isNil } from "lodash";

import { tabling } from "lib";

export const createStandardRequestSaga = (actionName: string, task: Redux.Task<null>) => {
  function* requestSaga(): SagaIterator {
    let lastTasks;
    while (true) {
      const action = yield take(actionName);
      if (lastTasks) {
        yield cancel(lastTasks);
      }
      lastTasks = yield call(task, action);
    }
  }
  function* rootSaga(): SagaIterator {
    yield spawn(requestSaga);
  }
  return rootSaga;
};

export const createTableSaga = <R extends Table.Row, M extends Model.Model>(
  actions: Pick<Redux.TableActionMap, "Request" | "TableChanged">,
  tasks: Redux.TableTaskMap<R, M>
) => {
  const reqSaga = createStandardRequestSaga(actions.Request, tasks.request);
  function* tableChangeEventSaga(): SagaIterator {
    // TODO: We probably want a way to prevent duplicate events that can cause
    // backend errors from occurring.  This would include things like trying to
    // delete the same row twice.
    const changeChannel = yield actionChannel(actions.TableChanged);
    while (true) {
      const action: Redux.Action<Table.ChangeEvent<R, M>> = yield take(changeChannel);
      if (!isNil(action.payload)) {
        const event: Table.ChangeEvent<R, M> = action.payload;
        if (tabling.typeguards.isDataChangeEvent(event)) {
          // Blocking call so that table changes happen sequentially.
          yield call(tasks.handleDataChangeEvent, action as Redux.Action<Table.DataChangeEvent<R, M>>);
        } else if (tabling.typeguards.isRowAddEvent(event)) {
          // Blocking call so that table changes happen sequentially.
          yield call(tasks.handleRowAddEvent, action as Redux.Action<Table.RowAddEvent<R, M>>);
        } else if (tabling.typeguards.isRowDeleteEvent(event)) {
          // Blocking call so that table changes happen sequentially.
          yield call(tasks.handleRowDeleteEvent, action as Redux.Action<Table.RowDeleteEvent<R, M>>);
        }
      }
    }
  }

  function* rootSaga(): SagaIterator {
    yield spawn(reqSaga);
    yield spawn(tableChangeEventSaga);
  }
  return rootSaga;
};

export const createBudgetTableSaga = <R extends BudgetTable.Row, M extends Model.Model>(
  actions: Pick<Redux.BudgetTableActionMap, "Request" | "TableChanged">,
  tasks: Redux.BudgetTableTaskMap<R, M>
) => {
  const reqSaga = createStandardRequestSaga(actions.Request, tasks.request);
  function* tableChangeEventSaga(): SagaIterator {
    // TODO: We probably want a way to prevent duplicate events that can cause
    // backend errors from occurring.  This would include things like trying to
    // delete the same row twice.
    const changeChannel = yield actionChannel(actions.TableChanged);
    while (true) {
      const action: Redux.Action<Table.ChangeEvent<R, M>> = yield take(changeChannel);
      if (!isNil(action.payload)) {
        const event: Table.ChangeEvent<R, M> = action.payload;
        if (tabling.typeguards.isDataChangeEvent(event)) {
          // Blocking call so that table changes happen sequentially.
          yield call(tasks.handleDataChangeEvent, action as Redux.Action<Table.DataChangeEvent<R, M>>);
        } else if (tabling.typeguards.isRowAddEvent(event)) {
          // Blocking call so that table changes happen sequentially.
          yield call(tasks.handleRowAddEvent, action as Redux.Action<Table.RowAddEvent<R, M>>);
        } else if (tabling.typeguards.isRowDeleteEvent(event)) {
          // Blocking call so that table changes happen sequentially.
          yield call(tasks.handleRowDeleteEvent, action as Redux.Action<Table.RowDeleteEvent<R, M>>);
        } else if (tabling.typeguards.isRowAddToGroupEvent(event) && !isNil(tasks.handleAddRowToGroupEvent)) {
          // Blocking call so that table changes happen sequentially.
          yield call(tasks.handleAddRowToGroupEvent, action as Redux.Action<Table.RowAddToGroupEvent<R, M>>);
        } else if (tabling.typeguards.isRowRemoveFromGroupEvent(event) && !isNil(tasks.handleRemoveRowFromGroupEvent)) {
          // Blocking call so that table changes happen sequentially.
          yield call(tasks.handleRemoveRowFromGroupEvent, action as Redux.Action<Table.RowRemoveFromGroupEvent<R, M>>);
        } else if (tabling.typeguards.isGroupDeleteEvent(event) && !isNil(tasks.handleDeleteGroupEvent)) {
          // Blocking call so that table changes happen sequentially.
          yield call(tasks.handleDeleteGroupEvent, action as Redux.Action<Table.GroupDeleteEvent>);
        }
      }
    }
  }

  function* rootSaga(): SagaIterator {
    yield spawn(reqSaga);
    yield spawn(tableChangeEventSaga);
  }
  return rootSaga;
};
