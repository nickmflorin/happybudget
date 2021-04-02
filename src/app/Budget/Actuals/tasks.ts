import { SagaIterator } from "redux-saga";
import { call, put, select } from "redux-saga/effects";
import { isNil, find } from "lodash";
import { handleRequestError } from "api";
import { ActualMapping } from "model/tableMappings";
import { getBudgetActuals, deleteActual, updateActual, createAccountActual, createSubAccountActual } from "services";
import { handleTableErrors } from "store/tasks";
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
} from "./actions";

export function* deleteActualTask(id: number): SagaIterator {
  yield put(deletingActualAction({ id, value: true }));
  try {
    yield call(deleteActual, id);
  } catch (e) {
    handleRequestError(e, "There was an error deleting the actual.");
  } finally {
    yield put(deletingActualAction({ id, value: false }));
  }
}

export function* updateActualTask(id: number, change: Table.RowChange): SagaIterator {
  yield put(updatingActualAction({ id, value: true }));
  try {
    yield call(updateActual, id, ActualMapping.patchPayload(change));
  } catch (e) {
    yield call(handleTableErrors, e, "There was an error updating the actual.", id, (errors: Table.CellError[]) =>
      addErrorsToStateAction(errors)
    );
  } finally {
    yield put(updatingActualAction({ id, value: false }));
  }
}

export function* createActualTask(id: number, row: Table.ActualRow): SagaIterator {
  let service = createAccountActual;
  if (row.parent_type === "subaccount") {
    service = createSubAccountActual;
  }
  yield put(creatingActualAction(true));
  try {
    const response: IActual = yield call(service, id, ActualMapping.postPayload(row));
    yield put(activatePlaceholderAction({ id: row.id, model: response }));
  } catch (e) {
    yield call(handleTableErrors, e, "There was an error updating the actual.", row.id, (errors: Table.CellError[]) =>
      addErrorsToStateAction(errors)
    );
  } finally {
    yield put(creatingActualAction(false));
  }
}

export function* handleActualRemovalTask(action: Redux.IAction<number>): SagaIterator {
  if (!isNil(action.payload)) {
    const models: IActual[] = yield select((state: Redux.IApplicationStore) => state.budget.actuals.data);
    const model: IActual | undefined = find(models, { id: action.payload });
    if (isNil(model)) {
      const placeholders = yield select((state: Redux.IApplicationStore) => state.budget.actuals.placeholders);
      const placeholder: Table.ActualRow | undefined = find(placeholders, { id: action.payload });
      if (isNil(placeholder)) {
        /* eslint-disable no-console */
        console.warn(
          `Inconsistent State!  Inconsistent state noticed when removing actual...
          The actual with ID ${action.payload} does not exist in state when it is expected to.`
        );
      } else {
        yield put(removePlaceholderFromStateAction(placeholder.id));
      }
    } else {
      yield put(removeActualFromStateAction(model.id));
      yield call(deleteActualTask, model.id);
    }
  }
}

export function* handleActualUpdateTask(action: Redux.IAction<Table.RowChange>): SagaIterator {
  const budgetId = yield select((state: Redux.IApplicationStore) => state.budget.budget.id);
  if (!isNil(budgetId) && !isNil(action.payload)) {
    const id = action.payload.id;
    const data: IActual[] = yield select((state: Redux.IApplicationStore) => state.budget.actuals.data);
    const model: IActual | undefined = find(data, { id });
    if (isNil(model)) {
      const placeholders = yield select((state: Redux.IApplicationStore) => state.budget.actuals.placeholders);
      const placeholder: Table.ActualRow | undefined = find(placeholders, { id });
      if (isNil(placeholder)) {
        /* eslint-disable no-console */
        console.error(
          `Inconsistent State!:  Inconsistent state noticed when updating actual in state...
          the actual with ID ${action.payload.id} does not exist in state when it is expected to.`
        );
      } else {
        const updatedRow = ActualMapping.newRowWithChanges(placeholder, action.payload);
        yield put(updatePlaceholderInStateAction(updatedRow));
        // Wait until all of the required fields are present before we create the entity in the
        // backend.  Once the entity is created in the backend, we can remove the placeholder
        // designation of the row so it will be updated instead of created the next time the row
        // is changed.
        if (ActualMapping.rowHasRequiredFields(updatedRow) && !isNil(updatedRow.object_id)) {
          yield call(createActualTask, updatedRow.object_id, updatedRow);
        }
      }
    } else {
      const updatedModel = ActualMapping.newModelWithChanges(model, action.payload);
      yield put(updateActualInStateAction(updatedModel));
      yield call(updateActualTask, model.id, action.payload);
    }
  }
}

export function* getActualsTask(action: Redux.IAction<null>): SagaIterator {
  const budgetId = yield select((state: Redux.IApplicationStore) => state.budget.budget.id);
  if (!isNil(budgetId)) {
    yield put(loadingActualsAction(true));
    try {
      const response = yield call(getBudgetActuals, budgetId, { no_pagination: true });
      yield put(responseActualsAction(response));
      if (response.data.length === 0) {
        yield put(addPlaceholdersToStateAction(2));
      }
    } catch (e) {
      handleRequestError(e, "There was an error retrieving the budget's actuals.");
      yield put(responseActualsAction({ count: 0, data: [] }, { error: e }));
    } finally {
      yield put(loadingActualsAction(false));
    }
  }
}
