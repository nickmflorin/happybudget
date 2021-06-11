import axios from "axios";
import { SagaIterator } from "redux-saga";
import { spawn, take, cancel, takeEvery, call, put, select, fork, cancelled, debounce, all } from "redux-saga/effects";
import { isNil, find, map } from "lodash";

import * as api from "api";
import * as models from "lib/model";

import { takeWithCancellableById } from "lib/redux/sagas";
import { warnInconsistentState } from "lib/redux/util";
import { consolidateTableChange } from "lib/model/util";

import { ActionType } from "../../actions";
import {
  activatePlaceholderAction,
  loadingActualsAction,
  responseActualsAction,
  deletingActualAction,
  creatingActualAction,
  updatingActualAction,
  removePlaceholderFromStateAction,
  removeActualFromStateAction,
  updatePlaceholderInStateAction,
  addPlaceholdersToStateAction,
  updateActualInStateAction,
  loadingBudgetItemsAction,
  responseBudgetItemsAction,
  loadingBudgetItemsTreeAction,
  responseBudgetItemsTreeAction
} from "../../actions/budget/actuals";

export function* deleteTask(id: number): SagaIterator {
  const CancelToken = axios.CancelToken;
  const source = CancelToken.source();
  yield put(deletingActualAction({ id, value: true }));
  try {
    yield call(api.deleteActual, id, { cancelToken: source.token });
  } catch (e) {
    if (!(yield cancelled())) {
      api.handleRequestError(e, "There was an error deleting the actual.");
    }
  } finally {
    yield put(deletingActualAction({ id, value: false }));
    if (yield cancelled()) {
      source.cancel();
    }
  }
}

export function* updateTask(id: number, change: Table.RowChange<BudgetTable.ActualRow>): SagaIterator {
  const CancelToken = axios.CancelToken;
  const source = CancelToken.source();
  yield put(updatingActualAction({ id, value: true }));
  try {
    yield call(api.updateActual, id, models.ActualRowManager.payload(change), { cancelToken: source.token });
  } catch (e) {
    if (!(yield cancelled())) {
      api.handleRequestError(e, "There was an error updating the actual.");
    }
  } finally {
    yield put(updatingActualAction({ id, value: false }));
    if (yield cancelled()) {
      source.cancel();
    }
  }
}

export function* bulkCreateTask(id: number, rows: BudgetTable.ActualRow[]): SagaIterator {
  const CancelToken = axios.CancelToken;
  const source = CancelToken.source();
  const requestPayload: Http.BulkCreatePayload<Http.ActualPayload> = {
    data: map(rows, (row: BudgetTable.ActualRow) => models.ActualRowManager.payload(row))
  };
  yield put(creatingActualAction(true));
  try {
    // NOTE: This assumes that the actuals in the response are in the same order as the
    // placeholder rows passed in.
    const response: Model.Actual[] = yield call(api.bulkCreateBudgetActuals, id, requestPayload, {
      cancelToken: source.token
    });
    yield all(
      map(response, (actual: Model.Actual, index: number) =>
        put(activatePlaceholderAction({ id: rows[index].id, model: actual }))
      )
    );
  } catch (e) {
    // Once we rebuild back in the error handling, we will have to be concerned here with the nested
    // structure of the errors.
    if (!(yield cancelled())) {
      api.handleRequestError(e, "There was an error updating the actuals.");
    }
  } finally {
    yield put(creatingActualAction(false));
    if (yield cancelled()) {
      source.cancel();
    }
  }
}

export function* bulkUpdateTask(id: number, changes: Table.RowChange<BudgetTable.ActualRow>[]): SagaIterator {
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
      put(updatingActualAction({ id: change.id, value: true }))
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
        put(updatingActualAction({ id: change.id, value: false }))
      )
    );
    if (yield cancelled()) {
      source.cancel();
    }
  }
}

export function* handleRemovalTask(action: Redux.Action<number>): SagaIterator {
  if (!isNil(action.payload)) {
    const ms: Model.Actual[] = yield select((state: Redux.ApplicationStore) => state.budgeting.budget.actuals.data);
    const model: Model.Actual | undefined = find(ms, { id: action.payload });
    if (isNil(model)) {
      const placeholders = yield select((state: Redux.ApplicationStore) => state.budgeting.budget.actuals.placeholders);
      const placeholder: BudgetTable.ActualRow | undefined = find(placeholders, { id: action.payload });
      if (isNil(placeholder)) {
        warnInconsistentState({
          action: action.type,
          reason: "Actual does not exist in state when it is expected to.",
          id: action.payload
        });
      } else {
        yield put(removePlaceholderFromStateAction(placeholder.id));
      }
    } else {
      yield put(removeActualFromStateAction(model.id));
      yield call(deleteTask, model.id);
    }
  }
}

export function* handleTableChangeTask(action: Redux.Action<Table.Change<BudgetTable.ActualRow>>): SagaIterator {
  const budgetId = yield select((state: Redux.ApplicationStore) => state.budgeting.budget.budget.id);
  if (!isNil(budgetId) && !isNil(action.payload)) {
    const merged: Table.RowChange<BudgetTable.ActualRow>[] = consolidateTableChange<BudgetTable.ActualRow>(
      action.payload
    );
    const data = yield select((state: Redux.ApplicationStore) => state.budgeting.budget.actuals.data);
    const placeholders = yield select((state: Redux.ApplicationStore) => state.budgeting.budget.actuals.placeholders);

    const updatesToPerform: Table.RowChange<BudgetTable.ActualRow>[] = [];
    const createsToPerform: BudgetTable.ActualRow[] = [];

    for (let i = 0; i < merged.length; i++) {
      const model: Model.Actual | undefined = find(data, { id: merged[i].id });
      if (isNil(model)) {
        const placeholder: BudgetTable.ActualRow | undefined = find(placeholders, { id: merged[i].id });
        if (isNil(placeholder)) {
          warnInconsistentState({
            action: action.type,
            reason: "Actual does not exist in state when it is expected to.",
            id: action.payload
          });
        } else {
          const updatedRow = models.ActualRowManager.mergeChangesWithRow(placeholder, merged[i]);
          yield put(updatePlaceholderInStateAction({ id: updatedRow.id, data: updatedRow }));
          // Wait until all of the required fields are present before we create the entity in the
          // backend.  Once the entity is created in the backend, we can remove the placeholder
          // designation of the row so it will be updated instead of created the next time the row
          // is changed.
          if (models.ActualRowManager.rowHasRequiredFields(updatedRow)) {
            createsToPerform.push(updatedRow);
          }
        }
      } else {
        const updatedModel = models.ActualRowManager.mergeChangesWithModel(model, merged[i]);
        yield put(updateActualInStateAction({ id: updatedModel.id, data: updatedModel }));
        updatesToPerform.push(merged[i]);
      }
    }
    if (updatesToPerform.length !== 0) {
      yield fork(bulkUpdateTask, budgetId, updatesToPerform);
    }
    if (createsToPerform.length !== 0) {
      yield fork(bulkCreateTask, budgetId, createsToPerform);
    }
  }
}

export function* getActualsTask(action: Redux.Action<null>): SagaIterator {
  const budgetId = yield select((state: Redux.ApplicationStore) => state.budgeting.budget.budget.id);
  if (!isNil(budgetId)) {
    const CancelToken = axios.CancelToken;
    const source = CancelToken.source();
    yield put(loadingActualsAction(true));
    try {
      const response = yield call(
        api.getBudgetActuals,
        budgetId,
        { no_pagination: true },
        { cancelToken: source.token }
      );
      yield put(responseActualsAction(response));
      if (response.data.length === 0) {
        yield put(addPlaceholdersToStateAction(2));
      }
    } catch (e) {
      if (!(yield cancelled())) {
        api.handleRequestError(e, "There was an error retrieving the budget's actuals.");
        yield put(responseActualsAction({ count: 0, data: [] }, { error: e }));
      }
    } finally {
      yield put(loadingActualsAction(false));
      if (yield cancelled()) {
        source.cancel();
      }
    }
  }
}

export function* getBudgetItemsTask(action: Redux.Action<null>): SagaIterator {
  const budgetId = yield select((state: Redux.ApplicationStore) => state.budgeting.budget.budget.id);
  if (!isNil(budgetId)) {
    const CancelToken = axios.CancelToken;
    const source = CancelToken.source();
    yield put(loadingBudgetItemsAction(true));
    try {
      const response = yield call(api.getBudgetItems, budgetId, { no_pagination: true }, { cancelToken: source.token });
      yield put(responseBudgetItemsAction(response));
    } catch (e) {
      if (!(yield cancelled())) {
        api.handleRequestError(e, "There was an error retrieving the budget's items.");
        yield put(responseBudgetItemsAction({ count: 0, data: [] }, { error: e }));
      }
    } finally {
      yield put(loadingBudgetItemsAction(false));
      if (yield cancelled()) {
        source.cancel();
      }
    }
  }
}

export function* getBudgetItemsTreeTask(action: Redux.Action<null>): SagaIterator {
  const budgetId = yield select((state: Redux.ApplicationStore) => state.budgeting.budget.budget.id);
  if (!isNil(budgetId)) {
    const search = yield select((state: Redux.ApplicationStore) => state.budgeting.budget.budgetItemsTree.search);
    const CancelToken = axios.CancelToken;
    const source = CancelToken.source();
    yield put(loadingBudgetItemsTreeAction(true));
    try {
      // TODO: Eventually we will want to build in pagination for this.
      const response = yield call(
        api.getBudgetItemsTree,
        budgetId,
        { no_pagination: true, search },
        { cancelToken: source.token }
      );
      yield put(responseBudgetItemsTreeAction(response));
    } catch (e) {
      if (!(yield cancelled())) {
        api.handleRequestError(e, "There was an error retrieving the budget's items.");
        yield put(responseBudgetItemsAction({ count: 0, data: [] }, { error: e }));
      }
    } finally {
      yield put(loadingBudgetItemsTreeAction(false));
      if (yield cancelled()) {
        source.cancel();
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

function* watchForRequestBudgetItemsSaga(): SagaIterator {
  let lastTasks;
  while (true) {
    const action = yield take(ActionType.Budget.BudgetItems.Request);
    if (lastTasks) {
      yield cancel(lastTasks);
    }
    lastTasks = yield call(getBudgetItemsTask, action);
  }
}

function* watchForRequestBudgetItemsTreeSaga(): SagaIterator {
  let lastTasks;
  while (true) {
    const action = yield take(ActionType.Budget.BudgetItemsTree.Request);
    if (lastTasks) {
      yield cancel(lastTasks);
    }
    lastTasks = yield call(getBudgetItemsTreeTask, action);
  }
}

function* watchForSearchBudgetItemsTreeSaga(): SagaIterator {
  yield debounce(250, ActionType.Budget.BudgetItemsTree.SetSearch, getBudgetItemsTreeTask);
}

function* watchForRemoveActualSaga(): SagaIterator {
  yield takeWithCancellableById<number>(ActionType.Budget.Actuals.Delete, handleRemovalTask, (p: number) => p);
}

function* watchForTableChangeSaga(): SagaIterator {
  yield takeEvery(ActionType.Budget.Actuals.TableChanged, handleTableChangeTask);
}

export default function* rootSaga(): SagaIterator {
  yield spawn(watchForRequestActualsSaga);
  yield spawn(watchForRemoveActualSaga);
  yield spawn(watchForTableChangeSaga);
  yield spawn(watchForRequestBudgetItemsSaga);
  yield spawn(watchForRequestBudgetItemsTreeSaga);
  yield spawn(watchForSearchBudgetItemsTreeSaga);
}
