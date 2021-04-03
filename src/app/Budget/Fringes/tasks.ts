import { SagaIterator } from "redux-saga";
import { call, put, select } from "redux-saga/effects";
import { isNil, find } from "lodash";
import { handleRequestError } from "api";
import { FringeMapping } from "model/tableMappings";
import { getFringes, deleteFringe, updateFringe, createFringe } from "services";
import { handleTableErrors } from "store/tasks";
import {
  activatePlaceholderAction,
  loadingFringesAction,
  responseFringesAction,
  deletingFringeAction,
  creatingFringeAction,
  updatingFringeAction,
  removePlaceholderFromStateAction,
  removeFringeFromStateAction,
  updatePlaceholderInStateAction,
  addPlaceholdersToStateAction,
  addErrorsToStateAction,
  updateFringeInStateAction
} from "./actions";

export function* deleteFringeTask(id: number): SagaIterator {
  yield put(deletingFringeAction({ id, value: true }));
  try {
    yield call(deleteFringe, id);
  } catch (e) {
    handleRequestError(e, "There was an error deleting the fringe.");
  } finally {
    yield put(deletingFringeAction({ id, value: false }));
  }
}

export function* updateFringeTask(id: number, change: Table.RowChange): SagaIterator {
  yield put(updatingFringeAction({ id, value: true }));
  try {
    yield call(updateFringe, id, FringeMapping.patchPayload(change));
  } catch (e) {
    yield call(handleTableErrors, e, "There was an error updating the fringe.", id, (errors: Table.CellError[]) =>
      addErrorsToStateAction(errors)
    );
  } finally {
    yield put(updatingFringeAction({ id, value: false }));
  }
}

export function* createFringeTask(row: Table.FringeRow): SagaIterator {
  const budgetId = yield select((state: Redux.IApplicationStore) => state.budget.budget.id);
  if (!isNil(budgetId)) {
    yield put(creatingFringeAction(true));
    try {
      const response: IFringe = yield call(createFringe, budgetId, FringeMapping.postPayload(row));
      yield put(activatePlaceholderAction({ id: row.id, model: response }));
    } catch (e) {
      yield call(handleTableErrors, e, "There was an error updating the fringe.", row.id, (errors: Table.CellError[]) =>
        addErrorsToStateAction(errors)
      );
    } finally {
      yield put(creatingFringeAction(false));
    }
  }
}

export function* handleFringeRemovalTask(action: Redux.IAction<number>): SagaIterator {
  if (!isNil(action.payload)) {
    const models: IFringe[] = yield select((state: Redux.IApplicationStore) => state.budget.fringes.data);
    const model: IFringe | undefined = find(models, { id: action.payload });
    if (isNil(model)) {
      const placeholders = yield select((state: Redux.IApplicationStore) => state.budget.fringes.placeholders);
      const placeholder: Table.FringeRow | undefined = find(placeholders, { id: action.payload });
      if (isNil(placeholder)) {
        /* eslint-disable no-console */
        console.warn(
          `Inconsistent State!  Inconsistent state noticed when removing fringe...
          The fringe with ID ${action.payload} does not exist in state when it is expected to.`
        );
      } else {
        yield put(removePlaceholderFromStateAction(placeholder.id));
      }
    } else {
      yield put(removeFringeFromStateAction(model.id));
      yield call(deleteFringeTask, model.id);
    }
  }
}

export function* handleFringeUpdateTask(action: Redux.IAction<Table.RowChange>): SagaIterator {
  const budgetId = yield select((state: Redux.IApplicationStore) => state.budget.budget.id);
  if (!isNil(budgetId) && !isNil(action.payload)) {
    const id = action.payload.id;
    const data: IFringe[] = yield select((state: Redux.IApplicationStore) => state.budget.fringes.data);
    const model: IFringe | undefined = find(data, { id });
    if (isNil(model)) {
      const placeholders = yield select((state: Redux.IApplicationStore) => state.budget.fringes.placeholders);
      const placeholder: Table.FringeRow | undefined = find(placeholders, { id });
      if (isNil(placeholder)) {
        /* eslint-disable no-console */
        console.error(
          `Inconsistent State!:  Inconsistent state noticed when updating fringe in state...
          the fringe with ID ${action.payload.id} does not exist in state when it is expected to.`
        );
      } else {
        const updatedRow = FringeMapping.newRowWithChanges(placeholder, action.payload);
        yield put(updatePlaceholderInStateAction(updatedRow));
        // Wait until all of the required fields are present before we create the entity in the
        // backend.  Once the entity is created in the backend, we can remove the placeholder
        // designation of the row so it will be updated instead of created the next time the row
        // is changed.
        if (FringeMapping.rowHasRequiredFields(updatedRow)) {
          yield call(createFringeTask, updatedRow);
        }
      }
    } else {
      const updatedModel = FringeMapping.newModelWithChanges(model, action.payload);
      yield put(updateFringeInStateAction(updatedModel));
      yield call(updateFringeTask, model.id, action.payload);
    }
  }
}

export function* getFringesTask(action: Redux.IAction<null>): SagaIterator {
  const budgetId = yield select((state: Redux.IApplicationStore) => state.budget.budget.id);
  if (!isNil(budgetId)) {
    yield put(loadingFringesAction(true));
    try {
      const response = yield call(getFringes, budgetId, { no_pagination: true });
      yield put(responseFringesAction(response));
      if (response.data.length === 0) {
        yield put(addPlaceholdersToStateAction(2));
      }
    } catch (e) {
      handleRequestError(e, "There was an error retrieving the budget's fringes.");
      yield put(responseFringesAction({ count: 0, data: [] }, { error: e }));
    } finally {
      yield put(loadingFringesAction(false));
    }
  }
}
