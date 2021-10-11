import axios from "axios";
import { SagaIterator } from "redux-saga";
import { put, call, cancelled, fork, select, all } from "redux-saga/effects";
import { map, isNil, filter } from "lodash";

import * as api from "api";
import * as tabling from "../../tabling";

type R = Tables.ActualRowData;
type M = Model.Actual;
type P = Http.ActualPayload;

export type ActualsTableActionMap = Redux.AuthenticatedTableActionMap<R, M> & {
  readonly loadingOwnerTree: boolean;
  readonly restoreOwnerTreeSearchCache: null;
  readonly responseOwnerTree: Http.ListResponse<Model.OwnerTreeNode>;
  readonly responseActualTypes: Http.ListResponse<Model.Tag>;
};

export type ActualsTableTaskConfig = Table.TaskConfig<R, M, ActualsTableActionMap> & {
  readonly selectObjId: (state: Application.Authenticated.Store) => number | null;
  readonly selectTreeSearch: (state: Application.Authenticated.Store) => string;
  readonly selectTreeCache: (state: Application.Authenticated.Store) => Redux.SearchCache<Model.OwnerTreeNode>;
};

export type ActualsTableTaskMap = Redux.TableTaskMap<R> & {
  readonly requestOwnerTree: null;
};

export const createTableTaskSet = (config: ActualsTableTaskConfig): Redux.TaskMapObject<ActualsTableTaskMap> => {
  const CancelToken = axios.CancelToken;
  const source = CancelToken.source();

  function* request(action: Redux.Action): SagaIterator {
    const budgetId = yield select(config.selectObjId);
    if (!isNil(budgetId)) {
      yield put(config.actions.loading(true));
      yield put(config.actions.clear(null));
      try {
        yield all([call(requestActuals, budgetId), call(requestActualTypes), call(requestOwnerTree, action)]);
      } catch (e: unknown) {
        if (!(yield cancelled())) {
          api.handleRequestError(e as Error, "There was an error retrieving the table data.");
          yield put(config.actions.response({ models: [] }));
        }
      } finally {
        yield put(config.actions.loading(false));
        if (yield cancelled()) {
          source.cancel();
        }
      }
    }
  }

  function* requestActualTypes(): SagaIterator {
    const response = yield call(api.getActualTypes, { cancelToken: source.token });
    yield put(config.actions.responseActualTypes(response));
  }

  function* requestActuals(budgetId: number): SagaIterator {
    const response: Http.ListResponse<M> = yield call(
      api.getBudgetActuals,
      budgetId,
      { no_pagination: true },
      { cancelToken: source.token }
    );
    if (response.data.length === 0) {
      // If there is no table data, we want to default create two rows.
      const createResponse: Http.BulkResponse<Model.Budget, M> = yield call(
        api.bulkCreateBudgetActuals,
        budgetId,
        { data: [{}, {}] },
        { cancelToken: source.token }
      );
      yield put(config.actions.response({ models: createResponse.children }));
    } else {
      yield put(config.actions.response({ models: response.data }));
    }
  }

  function* requestOwnerTree(action: Redux.Action<null>): SagaIterator {
    // We have to perform the select() inside of this task, instead of providing budgetId as a param,
    // because there is a saga that listens for an search action to be dispatched and then calls this
    // task.
    const budgetId = yield select((state: Application.Authenticated.Store) => state.budget.id);
    if (!isNil(budgetId)) {
      const search = yield select(config.selectTreeSearch);
      const cache = yield select(config.selectTreeCache);
      if (!isNil(cache[search])) {
        yield put(config.actions.restoreOwnerTreeSearchCache(null));
      } else {
        yield put(config.actions.loadingOwnerTree(true));
        try {
          // TODO: Eventually we will want to build in pagination for this.
          const response = yield call(
            api.getBudgetOwnerTree,
            budgetId,
            { no_pagination: true, search },
            { cancelToken: source.token }
          );
          yield put(config.actions.responseOwnerTree(response));
        } catch (e: unknown) {
          if (!(yield cancelled())) {
            api.handleRequestError(e as Error, "There was an error retrieving the budget's items.");
            yield put(config.actions.responseOwnerTree({ count: 0, data: [] }));
          }
        } finally {
          yield put(config.actions.loadingOwnerTree(false));
          if (yield cancelled()) {
            source.cancel();
          }
        }
      }
    }
  }

  function* bulkCreateTask(budgetId: number, e: Table.RowAddEvent<R>, errorMessage: string): SagaIterator {
    const requestPayload: Http.BulkCreatePayload<P> = tabling.http.createBulkCreatePayload<R, P, M>(
      e.payload,
      config.columns
    );
    yield put(config.actions.saving(true));
    try {
      const response: Http.BulkResponse<Model.Budget, M> = yield call(
        api.bulkCreateBudgetActuals,
        budgetId,
        requestPayload,
        { cancelToken: source.token }
      );
      // Note: We also have access to the updated budget here, we should use that.
      // Note: The logic in the reducer for activating the placeholder rows with real data relies on the
      // assumption that the models in the response are in the same order as the placeholder numbers.
      const placeholderIds: Table.PlaceholderRowId[] = map(
        Array.isArray(e.payload) ? e.payload : [e.payload],
        (rowAdd: Table.RowAdd<R>) => rowAdd.id
      );
      yield put(config.actions.addModelsToState({ placeholderIds: placeholderIds, models: response.children }));
    } catch (err: unknown) {
      if (!(yield cancelled())) {
        api.handleRequestError(err as Error, errorMessage);
      }
    } finally {
      yield put(config.actions.saving(false));
      if (yield cancelled()) {
        source.cancel();
      }
    }
  }

  function* bulkUpdateTask(
    budgetId: number,
    e: Table.ChangeEvent<R, M>,
    requestPayload: Http.BulkUpdatePayload<P>,
    errorMessage: string
  ): SagaIterator {
    yield put(config.actions.saving(true));
    try {
      // Note: We also have access to the updated budget here, we should use that.
      yield call(api.bulkUpdateBudgetActuals, budgetId, requestPayload, { cancelToken: source.token });
    } catch (err: unknown) {
      if (!(yield cancelled())) {
        api.handleRequestError(err as Error, errorMessage);
      }
    } finally {
      yield put(config.actions.saving(false));
      if (yield cancelled()) {
        source.cancel();
      }
    }
  }

  function* bulkDeleteTask(budgetId: number, ids: number[], errorMessage: string): SagaIterator {
    yield put(config.actions.saving(true));
    try {
      // Note: We also have access to the updated budget here, we should use that.
      yield call(api.bulkDeleteBudgetActuals, budgetId, ids, { cancelToken: source.token });
    } catch (err: unknown) {
      if (!(yield cancelled())) {
        api.handleRequestError(err as Error, errorMessage);
      }
    } finally {
      yield put(config.actions.saving(false));
      if (yield cancelled()) {
        source.cancel();
      }
    }
  }

  function* handleRowAddEvent(action: Redux.Action<Table.RowAddEvent<R>>): SagaIterator {
    const budgetId = yield select(config.selectObjId);
    if (!isNil(action.payload) && !isNil(budgetId)) {
      const e: Table.RowAddEvent<R> = action.payload;
      yield fork(bulkCreateTask, budgetId, e, "There was an error creating the rows.");
    }
  }

  function* handleRowDeleteEvent(action: Redux.Action<Table.RowDeleteEvent>): SagaIterator {
    const budgetId = yield select(config.selectObjId);
    if (!isNil(action.payload) && !isNil(budgetId)) {
      const e: Table.RowDeleteEvent = action.payload;
      const ids: Table.RowId[] = Array.isArray(e.payload.rows) ? e.payload.rows : [e.payload.rows];
      const modelRowIds = filter(ids, (id: Table.RowId) => tabling.typeguards.isModelRowId(id)) as number[];
      if (modelRowIds.length !== 0) {
        yield fork(bulkDeleteTask, budgetId, modelRowIds, "There was an error deleting the rows.");
      }
    }
  }

  function* handleDataChangeEvent(action: Redux.Action<Table.DataChangeEvent<R>>): SagaIterator {
    const budgetId = yield select(config.selectObjId);
    if (!isNil(action.payload) && !isNil(budgetId)) {
      const e = action.payload as Table.DataChangeEvent<R, Table.ModelRowId>;
      const merged = tabling.events.consolidateRowChanges(e.payload);
      if (merged.length !== 0) {
        const requestPayload = tabling.http.createBulkUpdatePayload<R, P, M>(merged, config.columns);
        yield fork(bulkUpdateTask, budgetId, e, requestPayload, "There was an error updating the rows.");
      }
    }
  }

  return {
    request,
    requestOwnerTree,
    handleChangeEvent: tabling.tasks.createChangeEventHandler({
      rowAdd: handleRowAddEvent,
      rowDelete: handleRowDeleteEvent,
      dataChange: handleDataChangeEvent
    })
  };
};
