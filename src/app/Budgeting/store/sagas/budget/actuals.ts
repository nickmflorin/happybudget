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

function* bulkCreateTask(budgetId: number, p: Table.RowAddPayload<BudgetTable.ActualRow, Model.Actual>): SagaIterator {
  const CancelToken = axios.CancelToken;
  const source = CancelToken.source();
  yield put(actions.creatingActualAction(true));

  const requestPayload: Http.BulkCreatePayload<Http.ActualPayload> = createBulkCreatePayload<
    BudgetTable.ActualRow,
    Model.Actual,
    Http.ActualPayload
  >(p);

  try {
    const actuals: Model.Actual[] = yield call(api.bulkCreateBudgetActuals, budgetId, requestPayload, {
      cancelToken: source.token
    });
    yield all(actuals.map((actual: Model.Actual) => put(actions.addActualToStateAction(actual))));
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

function* handleRowAddEvent(
  action: Redux.Action<Table.RowAddEvent<BudgetTable.ActualRow, Model.Actual>>
): SagaIterator {
  const budgetId = yield select((state: Modules.ApplicationStore) => state.budget.budget.budget.id);
  if (!isNil(budgetId) && !isNil(action.payload)) {
    const event: Table.RowAddEvent<BudgetTable.ActualRow, Model.Actual> = action.payload;
    yield fork(bulkCreateTask, budgetId, event.payload);
  }
}

function* handleRowDeleteEvent(action: Redux.Action<Table.RowDeleteEvent>): SagaIterator {
  const budgetId = yield select((state: Modules.ApplicationStore) => state.budget.budget.budget.id);
  if (!isNil(budgetId) && !isNil(action.payload)) {
    const event: Table.RowDeleteEvent = action.payload;
    const ms: Model.Actual[] = yield select((state: Modules.ApplicationStore) => state.budget.budget.actuals.data);
    let ids = Array.isArray(event.payload) ? event.payload : [event.payload];
    ids = filter(ids, (id: number) =>
      includes(
        map(ms, (m: Model.Actual) => m.id),
        id
      )
    );
    if (ids.length !== 0) {
      yield all(ids.map((id: number) => put(actions.deletingActualAction({ id, value: true }))));
      const CancelToken = axios.CancelToken;
      const source = CancelToken.source();
      try {
        yield call(api.bulkDeleteBudgetActuals, budgetId, ids, { cancelToken: source.token });
      } catch (e) {
        if (!(yield cancelled())) {
          api.handleRequestError(e, "There was an error deleting the actuals.");
        }
      } finally {
        yield all(ids.map((id: number) => put(actions.deletingActualAction({ id, value: false }))));
        if (yield cancelled()) {
          source.cancel();
        }
      }
    }
  }
}

function* handleDataChangeEvent(
  action: Redux.Action<Table.DataChangeEvent<BudgetTable.ActualRow, Model.Actual>>
): SagaIterator {
  const budgetId = yield select((state: Modules.ApplicationStore) => state.budget.budget.budget.id);
  if (!isNil(budgetId) && !isNil(action.payload)) {
    const event: Table.DataChangeEvent<BudgetTable.ActualRow, Model.Actual> = action.payload;

    const merged = consolidateTableChange(event.payload);
    if (merged.length !== 0) {
      const CancelToken = axios.CancelToken;
      const source = CancelToken.source();

      const requestPayload: Http.BulkUpdatePayload<Http.ActualPayload>[] = map(
        merged,
        (change: Table.RowChange<BudgetTable.ActualRow, Model.Actual>) => ({
          id: change.id,
          ...payload(change)
        })
      );
      yield all(
        merged.map((change: Table.RowChange<BudgetTable.ActualRow, Model.Actual>) =>
          put(actions.updatingActualAction({ id: change.id, value: true }))
        )
      );
      try {
        yield call(api.bulkUpdateBudgetActuals, budgetId, requestPayload, { cancelToken: source.token });
      } catch (e) {
        if (!(yield cancelled())) {
          api.handleRequestError(e, "There was an error updating the actuals.");
        }
      } finally {
        yield all(
          merged.map((change: Table.RowChange<BudgetTable.ActualRow, Model.Actual>) =>
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
    const action: Redux.Action<Table.ChangeEvent<BudgetTable.ActualRow, Model.Actual>> = yield take(changeChannel);
    if (!isNil(action.payload)) {
      const event: Table.ChangeEvent<BudgetTable.ActualRow, Model.Actual> = action.payload;
      if (typeguards.isDataChangeEvent(event)) {
        // Blocking call so that table changes happen sequentially.
        yield call(
          handleDataChangeEvent,
          action as Redux.Action<Table.DataChangeEvent<BudgetTable.ActualRow, Model.Actual>>
        );
      } else if (typeguards.isRowAddEvent(event)) {
        // Blocking call so that table changes happen sequentially.
        yield call(handleRowAddEvent, action as Redux.Action<Table.RowAddEvent<BudgetTable.ActualRow, Model.Actual>>);
      } else if (typeguards.isRowDeleteEvent(event)) {
        // Blocking call so that table changes happen sequentially.
        yield call(handleRowDeleteEvent, action as Redux.Action<Table.RowDeleteEvent>);
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
