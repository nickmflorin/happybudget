import axios from "axios";
import { SagaIterator } from "redux-saga";
import { spawn, take, cancel, takeEvery, call, put, select, fork, cancelled, debounce } from "redux-saga/effects";
import { isNil, find, map } from "lodash";

import * as api from "api";
import * as models from "lib/model";

import { takeWithCancellableById } from "lib/redux/sagas";
import { warnInconsistentState } from "lib/redux/util";
import { consolidateTableChange } from "lib/model/util";
import { handleTableErrors } from "store/tasks";

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
  addErrorsToStateAction,
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
      yield call(handleTableErrors, e, "There was an error updating the actual.", id, (errors: Table.CellError[]) =>
        addErrorsToStateAction(errors)
      );
    }
  } finally {
    yield put(updatingActualAction({ id, value: false }));
    if (yield cancelled()) {
      source.cancel();
    }
  }
}

export function* createTask(
  id: number,
  accountType: "account" | "subaccount",
  row: BudgetTable.ActualRow
): SagaIterator {
  const CancelToken = axios.CancelToken;
  const source = CancelToken.source();
  let service = api.createAccountActual;
  if (accountType === "subaccount") {
    service = api.createSubAccountActual;
  }
  yield put(creatingActualAction(true));
  try {
    const response: Model.Actual = yield call(service, id, models.ActualRowManager.payload(row), {
      cancelToken: source.token
    });
    yield put(activatePlaceholderAction({ id: row.id, model: response }));
  } catch (e) {
    if (!(yield cancelled())) {
      yield call(handleTableErrors, e, "There was an error updating the actual.", row.id, (errors: Table.CellError[]) =>
        addErrorsToStateAction(errors)
      );
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
  for (let i = 0; i++; i < changes.length) {
    yield put(updatingActualAction({ id: changes[i].id, value: true }));
  }
  try {
    yield call(api.bulkUpdateBudgetActuals, id, requestPayload, { cancelToken: source.token });
  } catch (e) {
    // Once we rebuild back in the error handling, we will have to be concerned here with the nested
    // structure of the errors.
    if (!(yield cancelled())) {
      yield call(handleTableErrors, e, "There was an error updating the actuals.", id, (errors: Table.CellError[]) =>
        addErrorsToStateAction(errors)
      );
    }
  } finally {
    for (let i = 0; i++; i < changes.length) {
      yield put(updatingActualAction({ id: changes[i].id, value: false }));
    }
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

export function* handleUpdateTask(action: Redux.Action<Table.RowChange<BudgetTable.ActualRow>>): SagaIterator {
  const budgetId = yield select((state: Redux.ApplicationStore) => state.budgeting.budget.budget.id);
  if (!isNil(budgetId) && !isNil(action.payload)) {
    const id = action.payload.id;
    const data: Model.Actual[] = yield select((state: Redux.ApplicationStore) => state.budgeting.budget.actuals.data);
    const model: Model.Actual | undefined = find(data, { id });
    if (isNil(model)) {
      const placeholders = yield select((state: Redux.ApplicationStore) => state.budgeting.budget.actuals.placeholders);
      const placeholder: BudgetTable.ActualRow | undefined = find(placeholders, { id });
      if (isNil(placeholder)) {
        warnInconsistentState({
          action: action.type,
          reason: "Actual does not exist in state when it is expected to.",
          id: action.payload
        });
      } else {
        const updatedRow = models.ActualRowManager.mergeChangesWithRow(placeholder, action.payload);
        yield put(updatePlaceholderInStateAction({ id: updatedRow.id, data: updatedRow }));
        // Wait until all of the required fields are present before we create the entity in the
        // backend.  Once the entity is created in the backend, we can remove the placeholder
        // designation of the row so it will be updated instead of created the next time the row
        // is changed.
        if (models.ActualRowManager.rowHasRequiredFields(updatedRow)) {
          // The account object should be present on the row, since it is a required field.
          if (isNil(updatedRow.account)) {
            throw new Error("The account must be a required field.");
          }
          yield call(createTask, updatedRow.account.id, updatedRow.account.type, updatedRow);
        }
      }
    } else {
      const updatedModel = models.ActualRowManager.mergeChangesWithModel(model, action.payload);
      yield put(updateActualInStateAction({ id: updatedModel.id, data: updatedModel }));
      yield call(updateTask, model.id, action.payload);
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

    const mergedUpdates: Table.RowChange<BudgetTable.ActualRow>[] = [];
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
          // NOTE: Since the only required field for the Actual is the parent, which is controlled
          // by the HTML select field, it cannot be copy/pasted and thus we do not have to worry
          // about the bulk creation of Actual(s) - only the bulk updating.
          const updatedRow = models.ActualRowManager.mergeChangesWithRow(placeholder, merged[i]);
          yield put(updatePlaceholderInStateAction({ id: updatedRow.id, data: updatedRow }));
        }
      } else {
        const updatedModel = models.ActualRowManager.mergeChangesWithModel(model, merged[i]);
        yield put(updateActualInStateAction({ id: updatedModel.id, data: updatedModel }));
        mergedUpdates.push(merged[i]);
      }
    }
    if (mergedUpdates.length !== 0) {
      yield fork(bulkUpdateTask, budgetId, mergedUpdates);
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
