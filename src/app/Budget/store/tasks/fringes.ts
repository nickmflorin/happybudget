import { SagaIterator } from "redux-saga";
import { call, put, select, fork } from "redux-saga/effects";
import { isNil, find, map, groupBy } from "lodash";
import { handleRequestError } from "api";
import { FringeRowManager } from "lib/tabling/managers";
import { mergeRowChanges } from "lib/tabling/util";
import { deleteFringe, updateFringe, createFringe, bulkUpdateFringes, bulkCreateFringes } from "api/services";
import { handleTableErrors } from "store/tasks";
import {
  activatePlaceholderAction,
  deletingFringeAction,
  creatingFringeAction,
  updatingFringeAction,
  removePlaceholderFromStateAction,
  removeFringeFromStateAction,
  updatePlaceholderInStateAction,
  addErrorsToStateAction,
  updateFringeInStateAction
} from "../actions/fringes";

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

export function* updateFringeTask(id: number, change: Table.RowChange<Table.FringeRow>): SagaIterator {
  yield put(updatingFringeAction({ id, value: true }));
  try {
    yield call(updateFringe, id, FringeRowManager.payload(change));
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
      const response: IFringe = yield call(createFringe, budgetId, FringeRowManager.payload(row));
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

export function* bulkUpdateFringesTask(id: number, changes: Table.RowChange<Table.FringeRow>[]): SagaIterator {
  const requestPayload: Http.IFringeBulkUpdatePayload[] = map(changes, (change: Table.RowChange<Table.FringeRow>) => ({
    id: change.id,
    ...FringeRowManager.payload(change)
  }));
  for (let i = 0; i++; i < changes.length) {
    yield put(updatingFringeAction({ id: changes[i].id, value: true }));
  }
  try {
    yield call(bulkUpdateFringes, id, requestPayload);
  } catch (e) {
    // Once we rebuild back in the error handling, we will have to be concerned here with the nested
    // structure of the errors.
    yield call(handleTableErrors, e, "There was an error updating the fringes.", id, (errors: Table.CellError[]) =>
      addErrorsToStateAction(errors)
    );
  } finally {
    for (let i = 0; i++; i < changes.length) {
      yield put(updatingFringeAction({ id: changes[i].id, value: false }));
    }
  }
}

export function* bulkCreateFringesTask(id: number, rows: Table.FringeRow[]): SagaIterator {
  const requestPayload: Http.IFringePayload[] = map(rows, (row: Table.FringeRow) => FringeRowManager.payload(row));
  yield put(creatingFringeAction(true));
  try {
    const fringes: IFringe[] = yield call(bulkCreateFringes, id, requestPayload);
    for (let i = 0; i < fringes.length; i++) {
      // It is not ideal that we have to do this, but we have no other way to map a placeholder
      // to the returned Fringe when bulk creating.  We can rely on the name field being
      // unique (at least we hope it is) - otherwise the request will fail.
      const placeholder = find(rows, { name: fringes[i].name });
      if (isNil(placeholder)) {
        /* eslint-disable no-console */
        console.error(
          `Could not map fringe ${fringes[i].id} to it's previous placeholder via the
          name, ${fringes[i].name}`
        );
      } else {
        yield put(activatePlaceholderAction({ id: placeholder.id, model: fringes[i] }));
      }
    }
  } catch (e) {
    // Once we rebuild back in the error handling, we will have to be concerned here with the nested
    // structure of the errors.
    yield call(handleTableErrors, e, "There was an error updating the fringes.", id, (errors: Table.CellError[]) =>
      addErrorsToStateAction(errors)
    );
  } finally {
    yield put(creatingFringeAction(false));
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

export function* handleFringeUpdateTask(action: Redux.IAction<Table.RowChange<Table.FringeRow>>): SagaIterator {
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
        const updatedRow = FringeRowManager.mergeChangesWithRow(placeholder, action.payload);
        yield put(updatePlaceholderInStateAction(updatedRow));
        // Wait until all of the required fields are present before we create the entity in the
        // backend.  Once the entity is created in the backend, we can remove the placeholder
        // designation of the row so it will be updated instead of created the next time the row
        // is changed.
        if (FringeRowManager.rowHasRequiredFields(updatedRow)) {
          yield call(createFringeTask, updatedRow);
        }
      }
    } else {
      const updatedModel = FringeRowManager.mergeChangesWithModel(model, action.payload);
      yield put(updateFringeInStateAction(updatedModel));
      yield call(updateFringeTask, model.id, action.payload);
    }
  }
}

export function* handleFringesBulkUpdateTask(action: Redux.IAction<Table.RowChange<Table.FringeRow>[]>): SagaIterator {
  const budgetId = yield select((state: Redux.IApplicationStore) => state.budget.budget.id);
  if (!isNil(budgetId) && !isNil(action.payload)) {
    const grouped = groupBy(action.payload, "id") as { [key: string]: Table.RowChange<Table.FringeRow>[] };
    const merged: Table.RowChange<Table.FringeRow>[] = map(
      grouped,
      (changes: Table.RowChange<Table.FringeRow>[], id: string) => {
        return { data: mergeRowChanges(changes).data, id: parseInt(id) };
      }
    );

    const data = yield select((state: Redux.IApplicationStore) => state.budget.fringes.data);
    const placeholders = yield select((state: Redux.IApplicationStore) => state.budget.fringes.placeholders);

    const mergedUpdates: Table.RowChange<Table.FringeRow>[] = [];
    const placeholdersToCreate: Table.FringeRow[] = [];

    for (let i = 0; i < merged.length; i++) {
      const model: IFringe | undefined = find(data, { id: merged[i].id });
      if (isNil(model)) {
        const placeholder: Table.FringeRow | undefined = find(placeholders, { id: merged[i].id });
        if (isNil(placeholder)) {
          /* eslint-disable no-console */
          console.error(
            `Inconsistent State!:  Inconsistent state noticed when updating fringe in state...
            the fringe with ID ${merged[i].id} does not exist in state when it is expected to.`
          );
        } else {
          const updatedRow = FringeRowManager.mergeChangesWithRow(placeholder, merged[i]);
          yield put(updatePlaceholderInStateAction(updatedRow));
          if (FringeRowManager.rowHasRequiredFields(updatedRow)) {
            placeholdersToCreate.push(updatedRow);
          }
        }
      } else {
        const updatedModel = FringeRowManager.mergeChangesWithModel(model, merged[i]);
        yield put(updateFringeInStateAction(updatedModel));
        mergedUpdates.push(merged[i]);
      }
    }
    if (mergedUpdates.length !== 0) {
      yield fork(bulkUpdateFringesTask, budgetId, mergedUpdates);
    }
    if (placeholdersToCreate.length !== 0) {
      yield fork(bulkCreateFringesTask, budgetId, placeholdersToCreate);
    }
  }
}
