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
import { isNil, map, filter, includes } from "lodash";

import * as api from "api";
import * as typeguards from "lib/model/typeguards";

import { consolidateTableChange, createBulkCreatePayload, payload } from "lib/model/util";

import { ActionType } from "../../actions";
import * as actions from "../../actions/budget/actuals";

type M = Model.Actual;
type R = BudgetTable.ActualRow;

function* bulkCreateTask(budgetId: number, p: Table.RowAddPayload<R, M>): SagaIterator {
  const CancelToken = axios.CancelToken;
  const source = CancelToken.source();
  yield put(actions.creatingActualAction(true));

  const requestPayload: Http.BulkCreatePayload<Http.ActualPayload> = createBulkCreatePayload<R, M, Http.ActualPayload>(
    p
  );

  try {
    const actuals: M[] = yield call(api.bulkCreateBudgetActuals, budgetId, requestPayload, {
      cancelToken: source.token
    });
    yield all(actuals.map((actual: M) => put(actions.addActualToStateAction(actual))));
  } catch (e) {
    if (!(yield cancelled())) {
      api.handleRequestError(e, "There was an error creating the actuals.");
    }
  } finally {
    yield put(actions.creatingActualAction(false));
    if (yield cancelled()) {
      source.cancel();
    }
  }
}

function* handleRowAddEvent(action: Redux.Action<Table.RowAddEvent<R, M>>): SagaIterator {
  const budgetId = yield select((state: Modules.ApplicationStore) => state.budget.budget.budget.id);
  if (!isNil(budgetId) && !isNil(action.payload)) {
    const event: Table.RowAddEvent<R, M> = action.payload;
    yield fork(bulkCreateTask, budgetId, event.payload);
  }
}

function* handleRowDeleteEvent(action: Redux.Action<Table.RowDeleteEvent<R, M>>): SagaIterator {
  const budgetId = yield select((state: Modules.ApplicationStore) => state.budget.budget.budget.id);
  if (!isNil(budgetId) && !isNil(action.payload)) {
    const event: Table.RowDeleteEvent<R, M> = action.payload;
    const ms: M[] = yield select((state: Modules.ApplicationStore) => state.budget.budget.actuals.data);
    let rows: R[] = Array.isArray(event.payload.rows) ? event.payload.rows : [event.payload.rows];
    rows = filter(rows, (row: R) =>
      includes(
        map(ms, (m: M) => m.id),
        row.id
      )
    );
    if (rows.length !== 0) {
      yield all(rows.map((row: R) => put(actions.deletingActualAction({ id: row.id, value: true }))));
      const CancelToken = axios.CancelToken;
      const source = CancelToken.source();
      try {
        yield call(
          api.bulkDeleteBudgetActuals,
          budgetId,
          map(rows, (row: R) => row.id),
          { cancelToken: source.token }
        );
      } catch (e) {
        if (!(yield cancelled())) {
          api.handleRequestError(e, "There was an error deleting the actuals.");
        }
      } finally {
        yield all(rows.map((row: R) => put(actions.deletingActualAction({ id: row.id, value: false }))));
        if (yield cancelled()) {
          source.cancel();
        }
      }
    }
  }
}

function* handleDataChangeEvent(action: Redux.Action<Table.DataChangeEvent<R, M>>): SagaIterator {
  const budgetId = yield select((state: Modules.ApplicationStore) => state.budget.budget.budget.id);
  if (!isNil(budgetId) && !isNil(action.payload)) {
    const event: Table.DataChangeEvent<R, M> = action.payload;

    const merged = consolidateTableChange(event.payload);
    if (merged.length !== 0) {
      const CancelToken = axios.CancelToken;
      const source = CancelToken.source();

      const requestPayload: Http.BulkUpdatePayload<Http.ActualPayload>[] = map(
        merged,
        (change: Table.RowChange<R, M>) => ({
          id: change.id,
          ...payload(change)
        })
      );
      yield all(
        merged.map((change: Table.RowChange<R, M>) => put(actions.updatingActualAction({ id: change.id, value: true })))
      );
      try {
        yield call(api.bulkUpdateBudgetActuals, budgetId, requestPayload, { cancelToken: source.token });
      } catch (e) {
        if (!(yield cancelled())) {
          api.handleRequestError(e, "There was an error updating the actuals.");
        }
      } finally {
        yield all(
          merged.map((change: Table.RowChange<R, M>) =>
            put(actions.updatingActualAction({ id: change.id, value: false }))
          )
        );
        if (yield cancelled()) {
          source.cancel();
        }
      }
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
        yield call(bulkCreateTask, budgetId, 2);
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
    const action: Redux.Action<Table.ChangeEvent<R, M>> = yield take(changeChannel);
    if (!isNil(action.payload)) {
      const event: Table.ChangeEvent<R, M> = action.payload;
      if (typeguards.isDataChangeEvent(event)) {
        // Blocking call so that table changes happen sequentially.
        yield call(handleDataChangeEvent, action as Redux.Action<Table.DataChangeEvent<R, M>>);
      } else if (typeguards.isRowAddEvent(event)) {
        // Blocking call so that table changes happen sequentially.
        yield call(handleRowAddEvent, action as Redux.Action<Table.RowAddEvent<R, M>>);
      } else if (typeguards.isRowDeleteEvent(event)) {
        // Blocking call so that table changes happen sequentially.
        yield call(handleRowDeleteEvent, action as Redux.Action<Table.RowDeleteEvent<R, M>>);
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
