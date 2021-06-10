import axios from "axios";
import { SagaIterator } from "redux-saga";
import { call, put, select, fork, cancelled } from "redux-saga/effects";
import { isNil, find, map } from "lodash";

import * as api from "api";
import * as models from "lib/model";

import { warnInconsistentState } from "lib/redux/util";
import { consolidateTableChange } from "lib/model/util";

export interface FringeTasksActionMap {
  response: Redux.ActionCreator<Http.ListResponse<Model.Fringe>>;
  loading: Redux.ActionCreator<boolean>;
  addPlaceholdersToState: Redux.ActionCreator<number>;
  clearPlaceholders: Redux.ActionCreator<null>;
  activatePlaceholder: Redux.ActionCreator<Table.ActivatePlaceholderPayload<Model.Fringe>>;
  deleting: Redux.ActionCreator<Redux.ModelListActionPayload>;
  creating: Redux.ActionCreator<boolean>;
  updating: Redux.ActionCreator<Redux.ModelListActionPayload>;
  removePlaceholderFromState: Redux.ActionCreator<number>;
  removeFromState: Redux.ActionCreator<number>;
  updatePlaceholderInState: Redux.ActionCreator<Redux.UpdateModelActionPayload<BudgetTable.FringeRow>>;
  updateInState: Redux.ActionCreator<Redux.UpdateModelActionPayload<Model.Fringe>>;
}

export interface FringeServiceSet<M extends Model.Template | Model.Budget> {
  request: (
    id: number,
    query: Http.ListQuery,
    options: Http.RequestOptions
  ) => Promise<Http.ListResponse<Model.Fringe>>;
  create: (id: number, payload: Http.FringePayload, options: Http.RequestOptions) => Promise<Model.Fringe>;
  bulkUpdate: (
    id: number,
    data: Http.BulkUpdatePayload<Http.FringePayload>[],
    options: Http.RequestOptions
  ) => Promise<M>;
  bulkCreate: (id: number, data: Http.FringePayload[], options: Http.RequestOptions) => Promise<Model.Fringe[]>;
}

export interface FringeTaskSet {
  getFringes: Redux.Task<null>;
  handleRemoval: Redux.Task<number>;
  handleTableChange: Redux.Task<Table.Change<BudgetTable.FringeRow>>;
}

export const createFringeTaskSet = <M extends Model.Template | Model.Budget>(
  actions: FringeTasksActionMap,
  services: FringeServiceSet<M>,
  selectObjId: (state: Redux.ApplicationStore) => number | null,
  selectFringes: (state: Redux.ApplicationStore) => Model.Fringe[],
  selectPlaceholders: (state: Redux.ApplicationStore) => BudgetTable.FringeRow[]
): FringeTaskSet => {
  function* deleteTask(id: number): SagaIterator {
    const CancelToken = axios.CancelToken;
    const source = CancelToken.source();
    yield put(actions.deleting({ id, value: true }));
    try {
      yield call(api.deleteFringe, id, { cancelToken: source.token });
    } catch (e) {
      if (!(yield cancelled())) {
        api.handleRequestError(e, "There was an error deleting the fringe.");
      }
    } finally {
      yield put(actions.deleting({ id, value: false }));
      if (yield cancelled()) {
        source.cancel();
      }
    }
  }

  function* bulkUpdateTask(id: number, changes: Table.RowChange<BudgetTable.FringeRow>[]): SagaIterator {
    const CancelToken = axios.CancelToken;
    const source = CancelToken.source();
    const requestPayload: Http.BulkUpdatePayload<Http.FringePayload>[] = map(
      changes,
      (change: Table.RowChange<BudgetTable.FringeRow>) => ({
        id: change.id,
        ...models.FringeRowManager.payload(change)
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
        api.handleRequestError(e, "There was an error updating the fringes.");
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

  function* bulkCreateTask(id: number, rows: BudgetTable.FringeRow[]): SagaIterator {
    const CancelToken = axios.CancelToken;
    const source = CancelToken.source();
    const requestPayload: Http.FringePayload[] = map(rows, (row: BudgetTable.FringeRow) =>
      models.FringeRowManager.payload(row)
    );
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
        api.handleRequestError(e, "There was an error updating the fringes.");
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
      const ms: Model.Fringe[] = yield select(selectFringes);
      const model: Model.Fringe | undefined = find(ms, { id: action.payload });
      if (isNil(model)) {
        const placeholders = yield select(selectPlaceholders);
        const placeholder: BudgetTable.FringeRow | undefined = find(placeholders, { id: action.payload });
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

  function* handleTableChangeTask(action: Redux.Action<Table.Change<BudgetTable.FringeRow>>): SagaIterator {
    const objId = yield select(selectObjId);
    if (!isNil(objId) && !isNil(action.payload)) {
      const merged = consolidateTableChange(action.payload);

      const data = yield select(selectFringes);
      const placeholders = yield select(selectPlaceholders);

      const mergedUpdates: Table.RowChange<BudgetTable.FringeRow>[] = [];
      const placeholdersToCreate: BudgetTable.FringeRow[] = [];

      for (let i = 0; i < merged.length; i++) {
        const model: Model.Fringe | undefined = find(data, { id: merged[i].id });
        if (isNil(model)) {
          const placeholder: BudgetTable.FringeRow | undefined = find(placeholders, { id: merged[i].id });
          if (isNil(placeholder)) {
            warnInconsistentState({
              action: action.type,
              reason: "Fringe does not exist in state when it is expected to.",
              id: action.payload
            });
          } else {
            const updatedRow = models.FringeRowManager.mergeChangesWithRow(placeholder, merged[i]);
            yield put(actions.updatePlaceholderInState({ id: updatedRow.id, data: updatedRow }));
            if (models.FringeRowManager.rowHasRequiredFields(updatedRow)) {
              placeholdersToCreate.push(updatedRow);
            }
          }
        } else {
          const updatedModel = models.FringeRowManager.mergeChangesWithModel(model, merged[i]);
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

  function* getFringesTask(action: Redux.Action<null>): SagaIterator {
    const objId = yield select(selectObjId);
    if (!isNil(objId)) {
      const CancelToken = axios.CancelToken;
      const source = CancelToken.source();
      yield put(actions.clearPlaceholders(null));
      yield put(actions.loading(true));
      try {
        const response = yield call(services.request, objId, { no_pagination: true }, { cancelToken: source.token });
        yield put(actions.response(response));
        if (response.data.length === 0) {
          yield put(actions.addPlaceholdersToState(2));
        }
      } catch (e) {
        if (!(yield cancelled())) {
          api.handleRequestError(e, "There was an error retrieving fringes.");
          yield put(actions.response({ count: 0, data: [] }, { error: e }));
        }
      } finally {
        yield put(actions.loading(false));
        if (yield cancelled()) {
          source.cancel();
        }
      }
    }
  }

  return {
    getFringes: getFringesTask,
    handleRemoval: handleRemovalTask,
    handleTableChange: handleTableChangeTask
  };
};
