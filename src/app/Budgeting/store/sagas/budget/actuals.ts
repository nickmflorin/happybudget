import axios from "axios";
import { SagaIterator } from "redux-saga";
import { spawn, take, cancel, takeEvery, call, put, select, fork, cancelled, debounce, all } from "redux-saga/effects";
import { isNil, find, map } from "lodash";

import * as api from "api";
import * as models from "lib/model";

import { takeWithCancellableById } from "lib/redux/sagas";
import { warnInconsistentState } from "lib/redux/util";
import { isAction } from "lib/redux/typeguards";
import { consolidateTableChange } from "lib/model/util";

import { ActionType } from "../../actions";
import * as actions from "../../actions/budget/actuals";

function* deleteTask(id: number): SagaIterator {
  const CancelToken = axios.CancelToken;
  const source = CancelToken.source();
  yield put(actions.deletingActualAction({ id, value: true }));
  try {
    yield call(api.deleteActual, id, { cancelToken: source.token });
  } catch (e) {
    if (!(yield cancelled())) {
      api.handleRequestError(e, "There was an error deleting the actual.");
    }
  } finally {
    yield put(actions.deletingActualAction({ id, value: false }));
    if (yield cancelled()) {
      source.cancel();
    }
  }
}

function* bulkCreateTask(action: Redux.Action<number> | number): SagaIterator {
  const budgetId = yield select((state: Modules.ApplicationStore) => state.budgeting.budget.budget.id);
  if (!isNil(budgetId) && (!isAction(action) || !isNil(action.payload))) {
    const CancelToken = axios.CancelToken;
    const source = CancelToken.source();
    yield put(actions.creatingActualAction(true));

    const count = isAction(action) ? action.payload : action;
    const payload: Http.BulkCreatePayload<Http.ActualPayload> = { count };

    try {
      const actuals: Model.Actual[] = yield call(api.bulkCreateBudgetActuals, budgetId, payload, {
        cancelToken: source.token
      });
      yield all(actuals.map((actual: Model.Actual) => put(actions.addActualToStateAction(actual))));
    } catch (e) {
      // Once we rebuild back in the error handling, we will have to be concerned here with the nested
      // structure of the errors.
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
}

function* bulkUpdateTask(id: number, changes: Table.RowChange<BudgetTable.ActualRow>[]): SagaIterator {
  const CancelToken = axios.CancelToken;
  const source = CancelToken.source();
  const requestPayload: Http.BulkUpdatePayload<Http.ActualPayload>[] = map(
    changes,
    (change: Table.RowChange<BudgetTable.ActualRow>) => ({
      id: change.id,
      ...models.ActualRowManager.payload(change)
    })
  );
  yield all(
    changes.map((change: Table.RowChange<BudgetTable.ActualRow>) =>
      put(actions.updatingActualAction({ id: change.id, value: true }))
    )
  );
  try {
    yield call(api.bulkUpdateBudgetActuals, id, requestPayload, { cancelToken: source.token });
  } catch (e) {
    // Once we rebuild back in the error handling, we will have to be concerned here with the nested
    // structure of the errors.
    if (!(yield cancelled())) {
      api.handleRequestError(e, "There was an error updating the actuals.");
    }
  } finally {
    yield all(
      changes.map((change: Table.RowChange<BudgetTable.ActualRow>) =>
        put(actions.updatingActualAction({ id: change.id, value: false }))
      )
    );
    if (yield cancelled()) {
      source.cancel();
    }
  }
}

function* handleRemovalTask(action: Redux.Action<number>): SagaIterator {
  if (!isNil(action.payload)) {
    const ms: Model.Actual[] = yield select((state: Modules.ApplicationStore) => state.budgeting.budget.actuals.data);
    const model: Model.Actual | undefined = find(ms, { id: action.payload });
    if (isNil(model)) {
      warnInconsistentState({
        action: action.type,
        reason: "Actual does not exist in state when it is expected to.",
        id: action.payload
      });
    } else {
      yield put(actions.removeActualFromStateAction(model.id));
      yield call(deleteTask, model.id);
    }
  }
}

function* handleTableChangeTask(action: Redux.Action<Table.Change<BudgetTable.ActualRow>>): SagaIterator {
  const budgetId = yield select((state: Modules.ApplicationStore) => state.budgeting.budget.budget.id);
  if (!isNil(budgetId) && !isNil(action.payload)) {
    const merged = consolidateTableChange(action.payload);
    const data = yield select((state: Modules.ApplicationStore) => state.budgeting.budget.actuals.data);

    const updatesToPerform: Table.RowChange<BudgetTable.ActualRow>[] = [];
    for (let i = 0; i < merged.length; i++) {
      const model: Model.Actual | undefined = find(data, { id: merged[i].id });
      if (isNil(model)) {
        warnInconsistentState({
          action: action.type,
          reason: "Actual does not exist in state when it is expected to.",
          id: merged[i].id
        });
      } else {
        const updatedModel = models.ActualRowManager.mergeChangesWithModel(model, merged[i]);
        yield put(actions.updateActualInStateAction({ id: updatedModel.id, data: updatedModel }));
        updatesToPerform.push(merged[i]);
      }
    }
    if (updatesToPerform.length !== 0) {
      yield fork(bulkUpdateTask, budgetId, updatesToPerform);
    }
  }
}

function* getActualsTask(action: Redux.Action<null>): SagaIterator {
  const budgetId = yield select((state: Modules.ApplicationStore) => state.budgeting.budget.budget.id);
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
        yield call(bulkCreateTask, 2);
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
  const budgetId = yield select((state: Modules.ApplicationStore) => state.budgeting.budget.budget.id);
  if (!isNil(budgetId)) {
    const search = yield select((state: Modules.ApplicationStore) => state.budgeting.budget.subAccountsTree.search);
    const cache = yield select((state: Modules.ApplicationStore) => state.budgeting.budget.subAccountsTree.cache);
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

function* watchForRequestActualsSaga(): SagaIterator {
  let lastTasks;
  while (true) {
    const action = yield take(ActionType.Budget.Actuals.Request);
    if (lastTasks) {
      yield cancel(lastTasks);
    }
    lastTasks = yield call(getActualsTask, action);
  }
}

function* watchForRequestSubAccountsTreeSaga(): SagaIterator {
  let lastTasks;
  while (true) {
    const action = yield take(ActionType.Budget.SubAccountsTree.Request);
    if (lastTasks) {
      yield cancel(lastTasks);
    }
    lastTasks = yield call(getSubAccountsTreeTask, action);
  }
}

function* watchForSearchSubAccountsTreeSaga(): SagaIterator {
  yield debounce(250, ActionType.Budget.SubAccountsTree.SetSearch, getSubAccountsTreeTask);
}

function* watchForRemoveActualSaga(): SagaIterator {
  yield takeWithCancellableById<number>(ActionType.Budget.Actuals.Delete, handleRemovalTask, (p: number) => p);
}

function* watchForTableChangeSaga(): SagaIterator {
  yield takeEvery(ActionType.Budget.Actuals.TableChanged, handleTableChangeTask);
}

function* watchForBulkCreateActualsSaga(): SagaIterator {
  let lastTasks;
  while (true) {
    const action: Redux.Action<number> = yield take(ActionType.Budget.Actuals.BulkCreate);
    if (!isNil(action.payload)) {
      if (lastTasks) {
        yield cancel(lastTasks);
      }
      lastTasks = yield call(bulkCreateTask, action);
    }
  }
}

export default function* rootSaga(): SagaIterator {
  yield spawn(watchForRequestActualsSaga);
  yield spawn(watchForRemoveActualSaga);
  yield spawn(watchForTableChangeSaga);
  yield spawn(watchForRequestSubAccountsTreeSaga);
  yield spawn(watchForSearchSubAccountsTreeSaga);
  yield spawn(watchForBulkCreateActualsSaga);
}
