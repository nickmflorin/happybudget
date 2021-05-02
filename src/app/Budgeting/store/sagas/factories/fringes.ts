import axios from "axios";
import { SagaIterator } from "redux-saga";
import { call, put, select, fork, cancelled } from "redux-saga/effects";
import { isNil, find, map, groupBy } from "lodash";

import { handleRequestError } from "api";
import { deleteFringe, updateFringe } from "api/services";

import { warnInconsistentState } from "lib/redux/util";
import { FringeRowManager } from "lib/tabling/managers";
import { mergeRowChanges } from "lib/tabling/util";
import { handleTableErrors } from "store/tasks";

export interface FringeTasksActionMap {
  activatePlaceholder: Redux.ActionCreator<Table.ActivatePlaceholderPayload<Model.Fringe>>;
  deleting: Redux.ActionCreator<Redux.ModelListActionPayload>;
  creating: Redux.ActionCreator<boolean>;
  updating: Redux.ActionCreator<Redux.ModelListActionPayload>;
  removePlaceholderFromState: Redux.ActionCreator<number>;
  removeFromState: Redux.ActionCreator<number>;
  updatePlaceholderInState: Redux.ActionCreator<Redux.UpdateModelActionPayload<Table.FringeRow>>;
  addErrorsToState: Redux.ActionCreator<Table.CellError | Table.CellError[]>;
  updateInState: Redux.ActionCreator<Redux.UpdateModelActionPayload<Model.Fringe>>;
}

export interface FringeServiceSet<M extends Model.Template | Model.Budget> {
  create: (id: number, payload: Http.FringePayload, options: Http.RequestOptions) => Promise<Model.Fringe>;
  bulkUpdate: (
    id: number,
    data: Http.BulkUpdatePayload<Http.FringePayload>[],
    options: Http.RequestOptions
  ) => Promise<M>;
  bulkCreate: (id: number, data: Http.FringePayload[], options: Http.RequestOptions) => Promise<Model.Fringe[]>;
}

export interface FringeTaskSet {
  handleRemoval: Redux.Task<number>;
  handleUpdate: Redux.Task<Table.RowChange<Table.FringeRow>>;
  handleBulkUpdate: Redux.Task<Table.RowChange<Table.FringeRow>[]>;
}

export const createFringeTaskSet = <M extends Model.Template | Model.Budget>(
  actions: FringeTasksActionMap,
  services: FringeServiceSet<M>,
  selectObjId: (state: Redux.ApplicationStore) => number | null,
  selectFringes: (state: Redux.ApplicationStore) => Model.Fringe[],
  selectPlaceholders: (state: Redux.ApplicationStore) => Table.FringeRow[]
): FringeTaskSet => {
  function* deleteTask(id: number): SagaIterator {
    const CancelToken = axios.CancelToken;
    const source = CancelToken.source();
    yield put(actions.deleting({ id, value: true }));
    try {
      yield call(deleteFringe, id, { cancelToken: source.token });
    } catch (e) {
      if (!(yield cancelled())) {
        handleRequestError(e, "There was an error deleting the fringe.");
      }
    } finally {
      yield put(actions.deleting({ id, value: false }));
      if (yield cancelled()) {
        source.cancel();
      }
    }
  }

  function* updateTask(id: number, change: Table.RowChange<Table.FringeRow>): SagaIterator {
    const CancelToken = axios.CancelToken;
    const source = CancelToken.source();
    yield put(actions.updating({ id, value: true }));
    try {
      yield call(updateFringe, id, FringeRowManager.payload(change), { cancelToken: source.token });
    } catch (e) {
      if (!(yield cancelled())) {
        yield call(handleTableErrors, e, "There was an error updating the fringe.", id, (errors: Table.CellError[]) =>
          actions.addErrorsToState(errors)
        );
      }
    } finally {
      yield put(actions.updating({ id, value: false }));
      if (yield cancelled()) {
        source.cancel();
      }
    }
  }

  function* createTask(row: Table.FringeRow): SagaIterator {
    const objId = yield select(selectObjId);
    if (!isNil(objId)) {
      const CancelToken = axios.CancelToken;
      const source = CancelToken.source();
      yield put(actions.creating(true));
      try {
        const response: Model.Fringe = yield call(services.create, objId, FringeRowManager.payload(row), {
          cancelToken: source.token
        });
        yield put(actions.activatePlaceholder({ id: row.id, model: response }));
      } catch (e) {
        if (!(yield cancelled())) {
          yield call(
            handleTableErrors,
            e,
            "There was an error updating the fringe.",
            row.id,
            (errors: Table.CellError[]) => actions.addErrorsToState(errors)
          );
        }
      } finally {
        yield put(actions.creating(false));
        if (yield cancelled()) {
          source.cancel();
        }
      }
    }
  }

  function* bulkUpdateTask(id: number, changes: Table.RowChange<Table.FringeRow>[]): SagaIterator {
    const CancelToken = axios.CancelToken;
    const source = CancelToken.source();
    const requestPayload: Http.BulkUpdatePayload<Http.FringePayload>[] = map(
      changes,
      (change: Table.RowChange<Table.FringeRow>) => ({
        id: change.id,
        ...FringeRowManager.payload(change)
      })
    );
    for (let i = 0; i++; i < changes.length) {
      yield put(actions.updating({ id: changes[i].id, value: true }));
    }
    try {
      yield call(services.bulkUpdate, id, requestPayload, { cancelToken: source.token });
    } catch (e) {
      // Once we rebuild back in the error handling, we will have to be concerned here with the nested
      // structure of the errors.
      if (!(yield cancelled())) {
        yield call(handleTableErrors, e, "There was an error updating the fringes.", id, (errors: Table.CellError[]) =>
          actions.addErrorsToState(errors)
        );
      }
    } finally {
      for (let i = 0; i++; i < changes.length) {
        yield put(actions.updating({ id: changes[i].id, value: false }));
      }
      if (yield cancelled()) {
        source.cancel();
      }
    }
  }

  function* bulkCreateTask(id: number, rows: Table.FringeRow[]): SagaIterator {
    const CancelToken = axios.CancelToken;
    const source = CancelToken.source();
    const requestPayload: Http.FringePayload[] = map(rows, (row: Table.FringeRow) => FringeRowManager.payload(row));
    yield put(actions.creating(true));
    try {
      const fringes: Model.Fringe[] = yield call(services.bulkCreate, id, requestPayload, {
        cancelToken: source.token
      });
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
          yield put(actions.activatePlaceholder({ id: placeholder.id, model: fringes[i] }));
        }
      }
    } catch (e) {
      // Once we rebuild back in the error handling, we will have to be concerned here with the nested
      // structure of the errors.
      if (!(yield cancelled())) {
        yield call(handleTableErrors, e, "There was an error updating the fringes.", id, (errors: Table.CellError[]) =>
          actions.addErrorsToState(errors)
        );
      }
    } finally {
      yield put(actions.creating(false));
      if (yield cancelled()) {
        source.cancel();
      }
    }
  }

  function* handleRemovalTask(action: Redux.Action<number>): SagaIterator {
    if (!isNil(action.payload)) {
      const models: Model.Fringe[] = yield select(selectFringes);
      const model: Model.Fringe | undefined = find(models, { id: action.payload });
      if (isNil(model)) {
        const placeholders = yield select(selectPlaceholders);
        const placeholder: Table.FringeRow | undefined = find(placeholders, { id: action.payload });
        if (isNil(placeholder)) {
          warnInconsistentState({
            action: action.type,
            reason: "Fringe does not exist in state when it is expected to.",
            id: action.payload
          });
        } else {
          yield put(actions.removePlaceholderFromState(placeholder.id));
        }
      } else {
        yield put(actions.removeFromState(model.id));
        yield call(deleteTask, model.id);
      }
    }
  }

  function* handleUpdateTask(action: Redux.Action<Table.RowChange<Table.FringeRow>>): SagaIterator {
    const objId = yield select(selectObjId);
    if (!isNil(objId) && !isNil(action.payload)) {
      const id = action.payload.id;
      const data: Model.Fringe[] = yield select(selectFringes);
      const model: Model.Fringe | undefined = find(data, { id });
      if (isNil(model)) {
        const placeholders = yield select(selectPlaceholders);
        const placeholder: Table.FringeRow | undefined = find(placeholders, { id });
        if (isNil(placeholder)) {
          warnInconsistentState({
            action: action.type,
            reason: "Fringe does not exist in state when it is expected to.",
            id: action.payload
          });
        } else {
          const updatedRow = FringeRowManager.mergeChangesWithRow(placeholder, action.payload);
          yield put(actions.updatePlaceholderInState({ id: updatedRow.id, data: updatedRow }));
          // Wait until all of the required fields are present before we create the entity in the
          // backend.  Once the entity is created in the backend, we can remove the placeholder
          // designation of the row so it will be updated instead of created the next time the row
          // is changed.
          if (FringeRowManager.rowHasRequiredFields(updatedRow)) {
            yield call(createTask, updatedRow);
          }
        }
      } else {
        const updatedModel = FringeRowManager.mergeChangesWithModel(model, action.payload);
        yield put(actions.updateInState({ id: updatedModel.id, data: updatedModel }));
        yield call(updateTask, model.id, action.payload);
      }
    }
  }

  function* handleBulkUpdateTask(action: Redux.Action<Table.RowChange<Table.FringeRow>[]>): SagaIterator {
    const objId = yield select(selectObjId);
    if (!isNil(objId) && !isNil(action.payload)) {
      const grouped = groupBy(action.payload, "id") as { [key: string]: Table.RowChange<Table.FringeRow>[] };
      const merged: Table.RowChange<Table.FringeRow>[] = map(
        grouped,
        (changes: Table.RowChange<Table.FringeRow>[], id: string) => {
          return { data: mergeRowChanges(changes).data, id: parseInt(id) };
        }
      );

      const data = yield select(selectFringes);
      const placeholders = yield select(selectPlaceholders);

      const mergedUpdates: Table.RowChange<Table.FringeRow>[] = [];
      const placeholdersToCreate: Table.FringeRow[] = [];

      for (let i = 0; i < merged.length; i++) {
        const model: Model.Fringe | undefined = find(data, { id: merged[i].id });
        if (isNil(model)) {
          const placeholder: Table.FringeRow | undefined = find(placeholders, { id: merged[i].id });
          if (isNil(placeholder)) {
            warnInconsistentState({
              action: action.type,
              reason: "Fringe does not exist in state when it is expected to.",
              id: action.payload
            });
          } else {
            const updatedRow = FringeRowManager.mergeChangesWithRow(placeholder, merged[i]);
            yield put(actions.updatePlaceholderInState({ id: updatedRow.id, data: updatedRow }));
            if (FringeRowManager.rowHasRequiredFields(updatedRow)) {
              placeholdersToCreate.push(updatedRow);
            }
          }
        } else {
          const updatedModel = FringeRowManager.mergeChangesWithModel(model, merged[i]);
          yield put(actions.updateInState({ id: updatedModel.id, data: updatedModel }));
          mergedUpdates.push(merged[i]);
        }
      }
      if (mergedUpdates.length !== 0) {
        yield fork(bulkUpdateTask, objId, mergedUpdates);
      }
      if (placeholdersToCreate.length !== 0) {
        yield fork(bulkCreateTask, objId, placeholdersToCreate);
      }
    }
  }

  return {
    handleRemoval: handleRemovalTask,
    handleUpdate: handleUpdateTask,
    handleBulkUpdate: handleBulkUpdateTask
  };
};