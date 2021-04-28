import axios from "axios";
import { SagaIterator } from "redux-saga";
import { spawn, take, cancel, takeEvery, call, put, select, fork, cancelled } from "redux-saga/effects";
import { isNil, find, map, groupBy } from "lodash";

import { handleRequestError } from "api";
import {
  getBudgetActuals,
  deleteActual,
  updateActual,
  createAccountActual,
  createSubAccountActual,
  bulkUpdateBudgetActuals
} from "api/services";

import { takeWithCancellableById } from "lib/redux/sagas";
import { warnInconsistentState } from "lib/redux/util";
import { ActualRowManager } from "lib/tabling/managers";
import { mergeRowChanges } from "lib/tabling/util";
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
  updateActualInStateAction
} from "../../actions/budget/actuals";

export function* deleteTask(id: number): SagaIterator {
  const CancelToken = axios.CancelToken;
  const source = CancelToken.source();
  yield put(deletingActualAction({ id, value: true }));
  try {
    yield call(deleteActual, id, { cancelToken: source.token });
  } catch (e) {
    if (!(yield cancelled())) {
      handleRequestError(e, "There was an error deleting the actual.");
    }
  } finally {
    yield put(deletingActualAction({ id, value: false }));
    if (yield cancelled()) {
      source.cancel();
    }
  }
}

export function* updateTask(id: number, change: Table.RowChange<Table.ActualRow>): SagaIterator {
  const CancelToken = axios.CancelToken;
  const source = CancelToken.source();
  yield put(updatingActualAction({ id, value: true }));
  try {
    yield call(updateActual, id, ActualRowManager.payload(change), { cancelToken: source.token });
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

export function* createTask(id: number, row: Table.ActualRow): SagaIterator {
  const CancelToken = axios.CancelToken;
  const source = CancelToken.source();
  let service = createAccountActual;
  if (row.parent_type === "subaccount") {
    service = createSubAccountActual;
  }
  yield put(creatingActualAction(true));
  try {
    const response: Model.Actual = yield call(service, id, ActualRowManager.payload(row), {
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

export function* bulkUpdateTask(id: number, changes: Table.RowChange<Table.ActualRow>[]): SagaIterator {
  const CancelToken = axios.CancelToken;
  const source = CancelToken.source();
  const requestPayload: Http.BulkUpdatePayload<Http.ActualPayload>[] = map(
    changes,
    (change: Table.RowChange<Table.ActualRow>) => ({
      id: change.id,
      ...ActualRowManager.payload(change)
    })
  );
  for (let i = 0; i++; i < changes.length) {
    yield put(updatingActualAction({ id: changes[i].id, value: true }));
  }
  try {
    yield call(bulkUpdateBudgetActuals, id, requestPayload, { cancelToken: source.token });
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
    const models: Model.Actual[] = yield select((state: Redux.ApplicationStore) => state.budget.actuals.data);
    const model: Model.Actual | undefined = find(models, { id: action.payload });
    if (isNil(model)) {
      const placeholders = yield select((state: Redux.ApplicationStore) => state.budget.actuals.placeholders);
      const placeholder: Table.ActualRow | undefined = find(placeholders, { id: action.payload });
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

export function* handleUpdateTask(action: Redux.Action<Table.RowChange<Table.ActualRow>>): SagaIterator {
  const budgetId = yield select((state: Redux.ApplicationStore) => state.budget.budget.id);
  if (!isNil(budgetId) && !isNil(action.payload)) {
    const id = action.payload.id;
    const data: Model.Actual[] = yield select((state: Redux.ApplicationStore) => state.budget.actuals.data);
    const model: Model.Actual | undefined = find(data, { id });
    if (isNil(model)) {
      const placeholders = yield select((state: Redux.ApplicationStore) => state.budget.actuals.placeholders);
      const placeholder: Table.ActualRow | undefined = find(placeholders, { id });
      if (isNil(placeholder)) {
        warnInconsistentState({
          action: action.type,
          reason: "Actual does not exist in state when it is expected to.",
          id: action.payload
        });
      } else {
        const updatedRow = ActualRowManager.mergeChangesWithRow(placeholder, action.payload);
        yield put(updatePlaceholderInStateAction({ id: updatedRow.id, data: updatedRow }));
        // Wait until all of the required fields are present before we create the entity in the
        // backend.  Once the entity is created in the backend, we can remove the placeholder
        // designation of the row so it will be updated instead of created the next time the row
        // is changed.
        if (ActualRowManager.rowHasRequiredFields(updatedRow) && !isNil(updatedRow.object_id)) {
          yield call(createTask, updatedRow.object_id, updatedRow);
        }
      }
    } else {
      const updatedModel = ActualRowManager.mergeChangesWithModel(model, action.payload);
      yield put(updateActualInStateAction({ id: updatedModel.id, data: updatedModel }));
      yield call(updateTask, model.id, action.payload);
    }
  }
}

export function* handleBulkUpdateTask(action: Redux.Action<Table.RowChange<Table.ActualRow>[]>): SagaIterator {
  const budgetId = yield select((state: Redux.ApplicationStore) => state.budget.budget.id);
  if (!isNil(budgetId) && !isNil(action.payload)) {
    const grouped = groupBy(action.payload, "id") as { [key: string]: Table.RowChange<Table.ActualRow>[] };
    const merged: Table.RowChange<Table.ActualRow>[] = map(
      grouped,
      (changes: Table.RowChange<Table.ActualRow>[], id: string) => {
        return { data: mergeRowChanges(changes).data, id: parseInt(id) };
      }
    );
    const data = yield select((state: Redux.ApplicationStore) => state.budget.actuals.data);
    const placeholders = yield select((state: Redux.ApplicationStore) => state.budget.actuals.placeholders);

    const mergedUpdates: Table.RowChange<Table.ActualRow>[] = [];
    for (let i = 0; i < merged.length; i++) {
      const model: Model.Actual | undefined = find(data, { id: merged[i].id });
      if (isNil(model)) {
        const placeholder: Table.ActualRow | undefined = find(placeholders, { id: merged[i].id });
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
          const updatedRow = ActualRowManager.mergeChangesWithRow(placeholder, merged[i]);
          yield put(updatePlaceholderInStateAction({ id: updatedRow.id, data: updatedRow }));
        }
      } else {
        const updatedModel = ActualRowManager.mergeChangesWithModel(model, merged[i]);
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
  const budgetId = yield select((state: Redux.ApplicationStore) => state.budget.budget.id);
  if (!isNil(budgetId)) {
    const CancelToken = axios.CancelToken;
    const source = CancelToken.source();
    yield put(loadingActualsAction(true));
    try {
      const response = yield call(getBudgetActuals, budgetId, { no_pagination: true }, { cancelToken: source.token });
      yield put(responseActualsAction(response));
      if (response.data.length === 0) {
        yield put(addPlaceholdersToStateAction(2));
      }
    } catch (e) {
      if (!(yield cancelled())) {
        handleRequestError(e, "There was an error retrieving the budget's actuals.");
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

function* watchForBulkUpdateActualsSaga(): SagaIterator {
  yield takeEvery(ActionType.Budget.BulkUpdateActuals, handleBulkUpdateTask);
}

function* watchForRemoveActualSaga(): SagaIterator {
  yield takeWithCancellableById<number>(ActionType.Budget.Actuals.Delete, handleRemovalTask, (p: number) => p);
}

function* watchForActualUpdateSaga(): SagaIterator {
  yield takeEvery(ActionType.Budget.Actuals.Update, handleUpdateTask);
}

export default function* rootSaga(): SagaIterator {
  yield spawn(watchForRequestActualsSaga);
  yield spawn(watchForRemoveActualSaga);
  yield spawn(watchForActualUpdateSaga);
  yield spawn(watchForBulkUpdateActualsSaga);
}
