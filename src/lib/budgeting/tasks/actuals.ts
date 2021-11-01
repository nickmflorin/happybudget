import { SagaIterator } from "redux-saga";
import { put, call, fork, select, all } from "redux-saga/effects";
import { map, isNil, filter } from "lodash";

import * as api from "api";
import { createTaskSet } from "store/tasks/contacts";
import { tabling, notifications } from "lib";

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
  readonly requestOwnerTree: Redux.Task<null>;
};

export const createTableTaskSet = (config: ActualsTableTaskConfig): ActualsTableTaskMap => {
  const contactsTasks = createTaskSet({ authenticated: true });

  function* request(action: Redux.Action): SagaIterator {
    const budgetId = yield select(config.selectObjId);
    if (!isNil(budgetId)) {
      yield put(config.actions.loading(true));
      yield put(config.actions.clear(null));
      try {
        yield all([
          call(requestActuals, budgetId),
          call(requestActualTypes),
          call(requestOwnerTree, action),
          call(contactsTasks.request, action as Redux.Action<null>)
        ]);
      } catch (e: unknown) {
        notifications.requestError(e as Error, "There was an error retrieving the table data.");
        yield put(config.actions.response({ models: [] }));
      } finally {
        yield put(config.actions.loading(false));
      }
    }
  }

  function* requestActualTypes(): SagaIterator {
    const response = yield api.request(api.getActualTypes);
    yield put(config.actions.responseActualTypes(response));
  }

  function* requestActuals(budgetId: number): SagaIterator {
    const response: Http.ListResponse<M> = yield api.request(api.getBudgetActuals, budgetId, {});
    if (response.data.length === 0) {
      // If there is no table data, we want to default create two rows.
      const createResponse: Http.BulkResponse<Model.Budget, M> = yield api.request(
        api.bulkCreateBudgetActuals,
        budgetId,
        { data: [{}, {}] }
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
          const response = yield api.request(api.getBudgetOwnerTree, budgetId, { search });
          yield put(config.actions.responseOwnerTree(response));
        } catch (e: unknown) {
          notifications.requestError(e as Error, "There was an error retrieving the budget's items.");
          yield put(config.actions.responseOwnerTree({ count: 0, data: [] }));
        } finally {
          yield put(config.actions.loadingOwnerTree(false));
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
      const response: Http.BulkResponse<Model.Budget, M> = yield api.request(
        api.bulkCreateBudgetActuals,
        budgetId,
        requestPayload
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
      notifications.requestError(err as Error, errorMessage);
    } finally {
      yield put(config.actions.saving(false));
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
      yield api.request(api.bulkUpdateBudgetActuals, budgetId, requestPayload);
    } catch (err: unknown) {
      notifications.requestError(err as Error, errorMessage);
    } finally {
      yield put(config.actions.saving(false));
    }
  }

  function* bulkDeleteTask(budgetId: number, ids: number[], errorMessage: string): SagaIterator {
    yield put(config.actions.saving(true));
    try {
      // Note: We also have access to the updated budget here, we should use that.
      yield api.request(api.bulkDeleteBudgetActuals, budgetId, ids);
    } catch (err: unknown) {
      notifications.requestError(err as Error, errorMessage);
    } finally {
      yield put(config.actions.saving(false));
    }
  }

  function* handleRowAddEvent(e: Table.RowAddEvent<R>): SagaIterator {
    const budgetId = yield select(config.selectObjId);
    if (!isNil(budgetId)) {
      yield fork(bulkCreateTask, budgetId, e, "There was an error creating the rows.");
    }
  }

  function* handleRowDeleteEvent(e: Table.RowDeleteEvent): SagaIterator {
    const budgetId = yield select(config.selectObjId);
    if (!isNil(budgetId)) {
      const ids: Table.RowId[] = Array.isArray(e.payload.rows) ? e.payload.rows : [e.payload.rows];
      const modelRowIds = filter(ids, (id: Table.RowId) => tabling.typeguards.isModelRowId(id)) as number[];
      if (modelRowIds.length !== 0) {
        yield fork(bulkDeleteTask, budgetId, modelRowIds, "There was an error deleting the rows.");
      }
    }
  }

  function* handleDataChangeEvent(e: Table.DataChangeEvent<R>): SagaIterator {
    const budgetId = yield select(config.selectObjId);
    if (!isNil(budgetId)) {
      const merged = tabling.events.consolidateRowChanges(e.payload);
      if (merged.length !== 0) {
        const requestPayload = tabling.http.createBulkUpdatePayload<R, P, M>(merged, config.columns);
        if (requestPayload.data.length !== 0) {
          yield fork(bulkUpdateTask, budgetId, e, requestPayload, "There was an error updating the rows.");
        }
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
