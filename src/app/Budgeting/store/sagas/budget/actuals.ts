import axios from "axios";
import { SagaIterator } from "redux-saga";
import {
  spawn,
  take,
  cancel,
  call,
  put,
  select,
  fork,
  cancelled,
  debounce,
  all,
  actionChannel
} from "redux-saga/effects";
import { isNil, map } from "lodash";

import * as api from "api";
import { tabling } from "lib";

import { ActionType } from "../../actions";
import { updateBudgetInStateAction } from "../../actions/budget";
import * as actions from "../../actions/budget/actuals";

type B = Model.Budget;
type C = Model.Actual;
type R = Tables.ActualRow;
type P = Http.ActualPayload;

function* bulkCreateTask(budgetId: number, e: Table.RowAddEvent<R, C>, errorMessage: string): SagaIterator {
  const CancelToken = axios.CancelToken;
  const source = CancelToken.source();

  const requestPayload: Http.BulkCreatePayload<P> = tabling.util.createBulkCreatePayload<R, C, P>(e.payload);
  yield put(actions.creatingActualAction(true));
  try {
    const response: Http.BulkCreateResponse<B, C> = yield call(api.bulkCreateBudgetActuals, budgetId, requestPayload, {
      cancelToken: source.token
    });
    yield all(response.children.map((actual: C) => put(actions.addActualToStateAction(actual))));
    yield put(updateBudgetInStateAction(response.data));
  } catch (err) {
    if (!(yield cancelled())) {
      api.handleRequestError(err, errorMessage);
    }
  } finally {
    yield put(actions.creatingActualAction(false));
    if (yield cancelled()) {
      source.cancel();
    }
  }
}

function* bulkUpdateTask(
  budgetId: number,
  requestPayload: Http.BulkUpdatePayload<P>[],
  errorMessage: string
): SagaIterator {
  const CancelToken = axios.CancelToken;
  const source = CancelToken.source();

  yield all(
    requestPayload.map((p: Http.BulkUpdatePayload<P>) => put(actions.updatingActualAction({ id: p.id, value: true })))
  );
  try {
    const response: Http.BulkResponse<B> = yield call(api.bulkUpdateBudgetActuals, budgetId, requestPayload, {
      cancelToken: source.token
    });
    yield put(updateBudgetInStateAction(response.data));
  } catch (err) {
    if (!(yield cancelled())) {
      api.handleRequestError(err, errorMessage);
    }
  } finally {
    yield all(
      requestPayload.map((p: Http.BulkUpdatePayload<P>) =>
        put(actions.updatingActualAction({ id: p.id, value: false }))
      )
    );
    if (yield cancelled()) {
      source.cancel();
    }
  }
}

function* bulkDeleteTask(budgetId: number, e: Table.RowDeleteEvent<R, C>, errorMessage: string): SagaIterator {
  const CancelToken = axios.CancelToken;
  const source = CancelToken.source();

  const rows: R[] = Array.isArray(e.payload.rows) ? e.payload.rows : [e.payload.rows];
  if (rows.length !== 0) {
    const ids = map(rows, (row: R) => row.id);

    yield all(ids.map((id: number) => put(actions.deletingActualAction({ id, value: true }))));
    try {
      const response: Http.BulkResponse<B> = yield call(api.bulkDeleteBudgetActuals, budgetId, ids, {
        cancelToken: source.token
      });
      yield put(updateBudgetInStateAction(response.data));
    } catch (err) {
      if (!(yield cancelled())) {
        api.handleRequestError(err, errorMessage);
      }
    } finally {
      yield all(ids.map((id: number) => put(actions.deletingActualAction({ id, value: false }))));
      if (yield cancelled()) {
        source.cancel();
      }
    }
  }
}

function* handleRowAddEvent(action: Redux.Action<Table.RowAddEvent<R, C>>): SagaIterator {
  const budgetId = yield select((state: Modules.ApplicationStore) => state.budget.budget.budget.id);
  if (!isNil(budgetId) && !isNil(action.payload)) {
    const e: Table.RowAddEvent<R, C> = action.payload;
    yield fork(bulkCreateTask, budgetId, e, "There was an error creating the actuals.");
  }
}

function* handleRowDeleteEvent(action: Redux.Action<Table.RowDeleteEvent<R, C>>): SagaIterator {
  const budgetId = yield select((state: Modules.ApplicationStore) => state.budget.budget.budget.id);
  if (!isNil(budgetId) && !isNil(action.payload)) {
    const e: Table.RowDeleteEvent<R, C> = action.payload;
    yield fork(bulkDeleteTask, budgetId, e, "There was an error deleting the acutals.");
  }
}

function* handleDataChangeEvent(action: Redux.Action<Table.DataChangeEvent<R, C>>): SagaIterator {
  const budgetId = yield select((state: Modules.ApplicationStore) => state.budget.budget.budget.id);
  if (!isNil(budgetId) && !isNil(action.payload)) {
    const e: Table.DataChangeEvent<R, C> = action.payload;
    const merged = tabling.util.consolidateTableChange(e.payload);
    if (merged.length !== 0) {
      const requestPayload: Http.BulkUpdatePayload<Http.ActualPayload>[] = map(
        merged,
        (change: Table.RowChange<R, C>) => ({
          id: change.id,
          ...tabling.util.payload(change)
        })
      );
      yield fork(bulkUpdateTask, budgetId, requestPayload, "There was an error updating the actuals.");
    }
  }
}

function* getActualsTask(action: Redux.Action<null>): SagaIterator {
  const budgetId = yield select((state: Modules.ApplicationStore) => state.budget.budget.budget.id);
  if (!isNil(budgetId)) {
    const CancelToken = axios.CancelToken;
    const source = CancelToken.source();
    yield put(actions.loadingActualsAction(true));
    try {
      const response = yield call(
        api.getBudgetActuals,
        budgetId,
        { no_pagination: true },
        { cancelToken: source.token }
      );
      yield put(actions.responseActualsAction(response));
      if (response.data.length === 0) {
        yield call(
          bulkCreateTask,
          budgetId,
          { type: "rowAdd", payload: 2 },
          "There was an error creating the actuals."
        );
      }
    } catch (e) {
      if (!(yield cancelled())) {
        api.handleRequestError(e, "There was an error retrieving the budget's actuals.");
        yield put(actions.responseActualsAction({ count: 0, data: [] }, { error: e }));
      }
    } finally {
      yield put(actions.loadingActualsAction(false));
      if (yield cancelled()) {
        source.cancel();
      }
    }
  }
}

function* getSubAccountsTreeTask(action: Redux.Action<null>): SagaIterator {
  const budgetId = yield select((state: Modules.ApplicationStore) => state.budget.budget.budget.id);
  if (!isNil(budgetId)) {
    const search = yield select((state: Modules.ApplicationStore) => state.budget.budget.subAccountsTree.search);
    const cache = yield select((state: Modules.ApplicationStore) => state.budget.budget.subAccountsTree.cache);
    if (!isNil(cache[search])) {
      yield put(actions.restoreSubAccountsTreeSearchCacheAction(null));
    } else {
      const CancelToken = axios.CancelToken;
      const source = CancelToken.source();
      yield put(actions.loadingSubAccountsTreeAction(true));
      try {
        // TODO: Eventually we will want to build in pagination for this.
        const response = yield call(
          api.getBudgetSubAccountsTree,
          budgetId,
          { no_pagination: true, search },
          { cancelToken: source.token }
        );
        yield put(actions.responseSubAccountsTreeAction(response));
      } catch (e) {
        if (!(yield cancelled())) {
          api.handleRequestError(e, "There was an error retrieving the budget's items.");
          yield put(actions.responseSubAccountsTreeAction({ count: 0, data: [] }, { error: e }));
        }
      } finally {
        yield put(actions.loadingSubAccountsTreeAction(false));
        if (yield cancelled()) {
          source.cancel();
        }
      }
    }
  }
}

function* tableChangeEventSaga(): SagaIterator {
  // TODO: We probably want a way to prevent duplicate events that can cause
  // backend errors from occurring.  This would include things like trying to
  // delete the same row twice.
  const changeChannel = yield actionChannel(ActionType.Budget.Actuals.TableChanged);
  while (true) {
    const action: Redux.Action<Table.ChangeEvent<R, C>> = yield take(changeChannel);
    if (!isNil(action.payload)) {
      const event: Table.ChangeEvent<R, C> = action.payload;
      if (tabling.typeguards.isDataChangeEvent(event)) {
        // Blocking call so that table changes happen sequentially.
        yield call(handleDataChangeEvent, action as Redux.Action<Table.DataChangeEvent<R, C>>);
      } else if (tabling.typeguards.isRowAddEvent(event)) {
        // Blocking call so that table changes happen sequentially.
        yield call(handleRowAddEvent, action as Redux.Action<Table.RowAddEvent<R, C>>);
      } else if (tabling.typeguards.isRowDeleteEvent(event)) {
        // Blocking call so that table changes happen sequentially.
        yield call(handleRowDeleteEvent, action as Redux.Action<Table.RowDeleteEvent<R, C>>);
      }
    }
  }
}

function* requestSaga(): SagaIterator {
  let lastTasks;
  while (true) {
    const action = yield take(ActionType.Budget.Actuals.Request);
    if (lastTasks) {
      yield cancel(lastTasks);
    }
    lastTasks = yield call(getActualsTask, action);
  }
}

function* requestTreeSaga(): SagaIterator {
  let lastTasks;
  while (true) {
    const action = yield take(ActionType.Budget.SubAccountsTree.Request);
    if (lastTasks) {
      yield cancel(lastTasks);
    }
    lastTasks = yield call(getSubAccountsTreeTask, action);
  }
}

function* searchTreeSaga(): SagaIterator {
  yield debounce(250, ActionType.Budget.SubAccountsTree.SetSearch, getSubAccountsTreeTask);
}

export default function* rootSaga(): SagaIterator {
  yield spawn(requestSaga);
  yield spawn(tableChangeEventSaga);
  yield spawn(requestTreeSaga);
  yield spawn(searchTreeSaga);
}
