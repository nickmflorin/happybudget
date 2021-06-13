import axios from "axios";
import { SagaIterator } from "redux-saga";
import { call, put, select, fork, cancelled, all } from "redux-saga/effects";
import { isNil, find, map } from "lodash";

import * as api from "api";
import * as models from "lib/model";

import { warnInconsistentState } from "lib/redux/util";
import { isAction } from "lib/redux/typeguards";
import { consolidateTableChange } from "lib/model/util";

export interface FringeTasksActionMap {
  response: Redux.ActionCreator<Http.ListResponse<Model.Fringe>>;
  loading: Redux.ActionCreator<boolean>;
  deleting: Redux.ActionCreator<Redux.ModelListActionPayload>;
  creating: Redux.ActionCreator<boolean>;
  updating: Redux.ActionCreator<Redux.ModelListActionPayload>;
  removeFromState: Redux.ActionCreator<number>;
  updateInState: Redux.ActionCreator<Redux.UpdateModelActionPayload<Model.Fringe>>;
  addToState: Redux.ActionCreator<Model.Fringe>;
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
  bulkCreate: (
    id: number,
    payload: Http.BulkCreatePayload<Http.FringePayload>,
    options: Http.RequestOptions
  ) => Promise<Model.Fringe[]>;
}

export interface FringeTaskSet {
  getFringes: Redux.Task<null>;
  handleRemoval: Redux.Task<number>;
  handleTableChange: Redux.Task<Table.Change<BudgetTable.FringeRow>>;
}

export const createFringeTaskSet = <M extends Model.Template | Model.Budget>(
  actions: FringeTasksActionMap,
  services: FringeServiceSet<M>,
  selectObjId: (state: Modules.ApplicationStore) => number | null,
  selectFringes: (state: Modules.ApplicationStore) => Model.Fringe[]
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

  function* bulkCreateTask(action: Redux.Action<number> | number): SagaIterator {
    const budgetId = yield select((state: Modules.ApplicationStore) => state.budgeting.budget.budget.id);
    if (!isNil(budgetId) && (!isAction(action) || !isNil(action.payload))) {
      const CancelToken = axios.CancelToken;
      const source = CancelToken.source();
      yield put(actions.creating(true));

      const count = isAction(action) ? action.payload : action;
      const payload: Http.BulkCreatePayload<Http.ActualPayload> = { count };

      try {
        const fringes: Model.Fringe[] = yield call(services.bulkCreate, budgetId, payload, {
          cancelToken: source.token
        });
        yield all(fringes.map((fringe: Model.Fringe) => put(actions.addToState(fringe))));
      } catch (e) {
        // Once we rebuild back in the error handling, we will have to be concerned here with the nested
        // structure of the errors.
        if (!(yield cancelled())) {
          api.handleRequestError(e, "There was an error creating the fringes.");
        }
      } finally {
        yield put(actions.creating(false));
        if (yield cancelled()) {
          source.cancel();
        }
      }
    }
  }

  function* handleRemovalTask(action: Redux.Action<number>): SagaIterator {
    if (!isNil(action.payload)) {
      const ms: Model.Fringe[] = yield select(selectFringes);
      const model: Model.Fringe | undefined = find(ms, { id: action.payload });
      if (isNil(model)) {
        warnInconsistentState({
          action: action.type,
          reason: "Fringe does not exist in state when it is expected to.",
          id: action.payload
        });
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
      const updatesToPerform: Table.RowChange<BudgetTable.FringeRow>[] = [];

      for (let i = 0; i < merged.length; i++) {
        const model: Model.Fringe | undefined = find(data, { id: merged[i].id });
        if (isNil(model)) {
          warnInconsistentState({
            action: action.type,
            reason: "Fringe does not exist in state when it is expected to.",
            id: action.payload
          });
        } else {
          const updatedModel = models.FringeRowManager.mergeChangesWithModel(model, merged[i]);
          yield put(actions.updateInState({ id: updatedModel.id, data: updatedModel }));
          updatesToPerform.push(merged[i]);
        }
      }
      if (updatesToPerform.length !== 0) {
        yield fork(bulkUpdateTask, objId, updatesToPerform);
      }
    }
  }

  function* getFringesTask(action: Redux.Action<null>): SagaIterator {
    const objId = yield select(selectObjId);
    if (!isNil(objId)) {
      const CancelToken = axios.CancelToken;
      const source = CancelToken.source();
      yield put(actions.loading(true));
      try {
        const response = yield call(services.request, objId, { no_pagination: true }, { cancelToken: source.token });
        yield put(actions.response(response));
        if (response.data.length === 0) {
          yield call(bulkCreateTask, 2);
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
