import { SagaIterator } from "redux-saga";
import { put, call, fork, select, all } from "redux-saga/effects";
import { isNil, filter } from "lodash";

import * as api from "api";
import { createTaskSet } from "store/tasks/contacts";
import { tabling, notifications } from "lib";

type R = Tables.ActualRowData;
type M = Model.Actual;
type P = Http.ActualPayload;

export type ActualsTableActionMap = Redux.AuthenticatedTableActionMap<R, M> & {
  readonly loadingActualOwners: boolean;
  readonly responseActualOwners: Http.ListResponse<Model.ActualOwner>;
  readonly responseActualTypes: Http.ListResponse<Model.Tag>;
  readonly updateBudgetInState: Redux.UpdateActionPayload<Model.Budget>;
};

export type ActualsTableTaskConfig = Table.TaskConfig<R, M, ActualsTableActionMap> & {
  readonly selectObjId: (state: Application.Authenticated.Store) => number | null;
  readonly selectStore: (state: Application.Authenticated.Store) => Tables.ActualTableStore;
  readonly selectOwnersSearch: (state: Application.Authenticated.Store) => string;
};

export type ActualsTableTaskMap = Redux.TableTaskMap<R> & {
  readonly requestActualOwners: Redux.Task<null>;
};

export const createTableTaskSet = (config: ActualsTableTaskConfig): ActualsTableTaskMap => {
  const contactsTasks = createTaskSet({ authenticated: true });

  function* request(action: Redux.Action): SagaIterator {
    const budgetId = yield select(config.selectObjId);
    if (!isNil(budgetId)) {
      yield put(config.actions.loading(true));
      try {
        yield all([
          call(requestActuals, budgetId),
          call(requestActualTypes),
          call(requestActualOwners, action),
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
    const response: Http.ListResponse<M> = yield api.request(api.getActuals, budgetId, {});
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

  function* requestActualOwners(action: Redux.Action<null>): SagaIterator {
    /* We have to perform the select() inside of this task, instead of providing
		   budgetId as a param, because there is a saga that listens for an search
			 action to be dispatched and then calls this task. */
    const budgetId = yield select((state: Application.Authenticated.Store) => state.budget.id);
    if (!isNil(budgetId)) {
      const search = yield select(config.selectOwnersSearch);
      yield put(config.actions.loadingActualOwners(true));
      try {
        const response = yield api.request(api.getBudgetActualOwners, budgetId, { search, page_size: 10 });
        yield put(config.actions.responseActualOwners(response));
      } catch (e: unknown) {
        notifications.requestError(e as Error, "There was an error retrieving the budget's items.");
        yield put(config.actions.responseActualOwners({ count: 0, data: [] }));
      } finally {
        yield put(config.actions.loadingActualOwners(false));
      }
    }
  }

  const bulkCreateTask: Redux.TableBulkCreateTask<R, [number]> = tabling.tasks.createBulkTask<
    R,
    M,
    Tables.ActualTableStore,
    P,
    Http.BulkResponse<Model.Budget, M>,
    [number]
  >({
    columns: config.columns,
    selectStore: config.selectStore,
    loadingActions: [config.actions.saving],
    responseActions: (r: Http.BulkResponse<Model.Budget, M>, e: Table.RowAddEvent<R>) => [
      config.actions.addModelsToState({ placeholderIds: e.placeholderIds, models: r.children }),
      config.actions.updateBudgetInState({ id: r.data.id, data: r.data })
    ],
    bulkCreate: (objId: number) => [api.bulkCreateBudgetActuals, objId]
  });

  function* bulkUpdateTask(
    budgetId: number,
    e: Table.ChangeEvent<R, M>,
    requestPayload: Http.BulkUpdatePayload<P>,
    errorMessage: string
  ): SagaIterator {
    yield put(config.actions.saving(true));
    try {
      const r: Http.BulkResponse<Model.Budget, M> = yield api.request(
        api.bulkUpdateBudgetActuals,
        budgetId,
        requestPayload
      );
      yield put(config.actions.updateBudgetInState({ id: r.data.id, data: r.data }));
    } catch (err: unknown) {
      notifications.requestError(err as Error, errorMessage);
    } finally {
      yield put(config.actions.saving(false));
    }
  }

  function* bulkDeleteTask(budgetId: number, ids: number[], errorMessage: string): SagaIterator {
    yield put(config.actions.saving(true));
    try {
      const r: Http.BulkDeleteResponse<Model.Budget> = yield api.request(api.bulkDeleteBudgetActuals, budgetId, ids);
      yield put(config.actions.updateBudgetInState({ id: r.data.id, data: r.data }));
    } catch (err: unknown) {
      notifications.requestError(err as Error, errorMessage);
    } finally {
      yield put(config.actions.saving(false));
    }
  }

  function* handleRowPositionChangedEvent(e: Table.RowPositionChangedEvent): SagaIterator {
    yield put(config.actions.saving(true));
    try {
      const response: M = yield api.request(api.updateActual, e.payload.id, {
        previous: e.payload.previous
      });
      yield put(
        config.actions.tableChanged({
          type: "modelUpdated",
          payload: { model: response }
        })
      );
    } catch (err: unknown) {
      notifications.requestError(err as Error, "There was an error moving the row.");
    } finally {
      yield put(config.actions.saving(false));
    }
  }

  function* handleRowInsertEvent(e: Table.RowInsertEvent<R>): SagaIterator {
    const objId = yield select(config.selectObjId);
    if (!isNil(objId)) {
      yield put(config.actions.saving(true));
      try {
        const response: M = yield api.request(api.createActual, objId, {
          previous: e.payload.previous,
          ...tabling.http.postPayload(e.payload.data, config.columns)
        });
        yield put(
          config.actions.tableChanged({
            type: "modelAdded",
            payload: { model: response }
          })
        );
      } catch (err: unknown) {
        notifications.requestError(err as Error, "There was an error adding the row.");
      } finally {
        yield put(config.actions.saving(false));
      }
    }
  }

  function* handleRowAddEvent(e: Table.RowAddEvent<R>): SagaIterator {
    const budgetId = yield select(config.selectObjId);
    if (!isNil(budgetId)) {
      yield fork(bulkCreateTask, e, "There was an error creating the rows.", budgetId);
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
    requestActualOwners,
    handleChangeEvent: tabling.tasks.createChangeEventHandler({
      rowAdd: handleRowAddEvent,
      rowInsert: handleRowInsertEvent,
      rowDelete: handleRowDeleteEvent,
      dataChange: handleDataChangeEvent,
      rowPositionChanged: handleRowPositionChangedEvent
    })
  };
};
